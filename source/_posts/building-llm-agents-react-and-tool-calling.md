---
title: 从零构建大模型自主智能体：ReAct 范式、Tool Calling 与短期/长期记忆设计
date: 2026-09-11 13:00:00
tags:
  - Agent
  - 智能体
  - ReAct
  - Function Calling
  - 规划与决策
categories:
  - 大模型应用开发
excerpt: 从 Prompt Engineering 到自主 Agent 的范式演进，解析 ReAct 思考-行动-观察循环、Function Calling 交互流程与 Schema 定义，手写支持天气查询与数学计算的微型 ReAct 智能体。
index_img: /img/posts/default-cover.png
math: false
comments: true
---

## 1、从 Prompt Engineering 到自主 Agent 的范式演进

大语言模型的应用范式经历了三个阶段的演进：

| 阶段 | 范式 | 特征 | 局限 |
|------|------|------|------|
| **1.0** | Prompt Engineering | 单轮/少轮提示，人工设计 Prompt 模板 | 无法获取外部信息，无法执行动作 |
| **2.0** | Tool-Augmented LLM | LLM + 外部工具调用（搜索、计算、API） | 工具调用是单次的，缺乏自主规划 |
| **3.0** | Autonomous Agent | LLM 自主规划 → 选择工具 → 观察结果 → 迭代决策 | 复杂度高，需精心设计记忆与规划机制 |

**Agent 的核心定义：** 一个能够**感知环境**、**自主规划决策**、**调用工具执行动作**、**从观察中学习迭代**的自主系统。

## 2、ReAct（Reasoning + Acting）范式

ReAct（Yao et al., 2023）是当前最主流的 Agent 推理框架，其核心思想是**交替进行推理（Thought）与行动（Action）**，每次行动后观察结果（Observation），再基于观察继续推理。

### 2.1 ReAct 循环

```
用户输入: "北京明天的气温比上海高多少度？"

Thought 1: 我需要分别查询北京和上海明天的天气数据。
Action 1: get_weather(city="北京", date="明天")
Observation 1: 北京明天晴，气温 32°C，湿度 45%

Thought 2: 已获取北京气温 32°C，现在查询上海。
Action 2: get_weather(city="上海", date="明天")
Observation 2: 上海明天多云，气温 28°C，湿度 70%

Thought 3: 北京 32°C - 上海 28°C = 4°C，可以给出最终答案。
Answer: 北京明天的气温比上海高 4°C（北京 32°C，上海 28°C）。
```

### 2.2 ReAct vs CoT vs Act-only

| 方法 | 推理 | 行动 | 优势 | 劣势 |
|------|------|------|------|------|
| **CoT** (Chain-of-Thought) | ✅ | ❌ | 推理链清晰 | 无法获取外部信息 |
| **Act-only** | ❌ | ✅ | 可与外部交互 | 缺乏推理，行动盲目 |
| **ReAct** | ✅ | ✅ | 推理引导行动，行动反馈推理 | Token 消耗较大 |

## 3、Function Calling（工具调用）数据结构与交互流程

### 3.1 工具 Schema 定义

Function Calling 要求每个工具以 JSON Schema 格式声明其接口：

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "查询指定城市的天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "城市名称，如'北京'、'上海'",
                    },
                    "date": {
                        "type": "string",
                        "description": "日期，如'今天'、'明天'，默认为今天",
                    },
                },
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "calculate",
            "description": "执行数学表达式计算",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "数学表达式，如'32 - 28'、'2 ** 10'",
                    },
                },
                "required": ["expression"],
            },
        },
    },
]
```

### 3.2 交互流程

```
1. 客户端发送: messages + tools → LLM
2. LLM 返回: tool_call (name + arguments)  ← LLM 选择调用哪个工具
3. 客户端执行: result = execute_tool(name, arguments)
4. 客户端发送: messages + tool_result → LLM
5. LLM 返回: 最终文本回答 或 继续调用工具 (回到步骤2)
```

## 4、智能体三大中枢设计

### 4.1 规划（Planning）

规划模块负责将复杂目标分解为可执行的子任务序列：

- **静态分解**：一次性生成完整计划（Plan-then-Execute）。
- **动态调整**：每步执行后根据观察结果重新规划（Adaptive Planning）。
- **代表框架**：Plan-and-Solve、Tree of Thoughts（ToT）、Reflexion。

### 4.2 记忆（Memory）

| 类型 | 实现 | 用途 |
|------|------|------|
| **短期记忆** | 对话上下文滑动窗口（最近 K 轮） | 维持当前任务的连贯性 |
| **长期记忆** | 向量数据库存储历史经验 | 跨任务知识积累与检索 |
| **工作记忆** | Scratchpad / 状态字典 | 当前任务的中间结果暂存 |

**短期记忆的滑动窗口实现：**

```python
from collections import deque

class ShortTermMemory:
    def __init__(self, max_turns: int = 10):
        self.buffer = deque(maxlen=max_turns)

    def add(self, role: str, content: str):
        self.buffer.append({"role": role, "content": content})

    def get_messages(self):
        return list(self.buffer)
```

### 4.3 执行（Tools / Executors）

工具是 Agent 与外部世界交互的唯一通道。每个工具应满足：

- **单一职责**：一个工具只做一件事。
- **幂等安全**：重复调用不产生副作用。
- **错误可观测**：返回结构化错误信息而非抛异常。

## 5、手写微型 ReAct 智能体

以下实现一个支持天气查询与数学计算的 ReAct 智能体，不依赖任何 Agent 框架：

```python
import json
import re

# ── 工具实现 ──────────────────────────────────────────

def get_weather(city: str, date: str = "今天") -> str:
    """模拟天气查询工具"""
    weather_db = {
        "北京": {"今天": "晴，32°C，湿度45%", "明天": "多云，30°C，湿度55%"},
        "上海": {"今天": "多云，28°C，湿度70%", "明天": "小雨，26°C，湿度85%"},
        "深圳": {"今天": "阵雨，33°C，湿度80%", "明天": "晴，34°C，湿度60%"},
    }
    if city not in weather_db:
        return f"未找到城市'{city}'的天气数据"
    return f"{city}{date}天气：{weather_db[city].get(date, '暂无数据')}"


def calculate(expression: str) -> str:
    """安全的数学表达式计算工具"""
    # 白名单安全校验：仅允许数字、运算符和括号
    if not re.match(r'^[\d\s\+\-\*/\.\(\)]+$', expression):
        return "错误：表达式包含非法字符"
    try:
        result = eval(expression, {"__builtins__": {}}, {})
        return f"计算结果：{expression} = {result}"
    except Exception as e:
        return f"计算错误：{e}"


# 工具注册表
TOOL_REGISTRY = {
    "get_weather": get_weather,
    "calculate": calculate,
}

# ── ReAct 智能体 ─────────────────────────────────────

SYSTEM_PROMPT = """你是一个智能助手，可以使用以下工具来回答问题：

1. get_weather(city, date="今天"): 查询城市天气
2. calculate(expression): 计算数学表达式

请严格按照以下格式思考和行动：

Thought: 你的推理过程
Action: 工具名称(参数)
Observation: (工具返回结果，由系统自动填充)

当你有足够信息时，使用以下格式给出最终答案：
Thought: 我的推理过程
Answer: 最终答案"""

def parse_action(action_str: str):
    """解析 Action 字符串为工具名和参数"""
    match = re.match(r'(\w+)\((.*)\)', action_str)
    if not match:
        return None, None
    tool_name = match.group(1)
    args_str = match.group(2)
    # 解析 key=value 参数
    kwargs = {}
    for arg in args_str.split(','):
        arg = arg.strip()
        if '=' in arg:
            k, v = arg.split('=', 1)
            kwargs[k.strip()] = v.strip().strip('"').strip("'")
        elif arg:
            kwargs[arg] = arg  # 位置参数作为值
    return tool_name, kwargs


def react_agent(query: str, max_iterations: int = 5) -> str:
    """ReAct 智能体主循环"""
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": query},
    ]

    for i in range(max_iterations):
        # 这里应调用 LLM 生成回复，为演示目的使用模拟推理
        # 实际生产中替换为: response = llm.chat(messages)
        print(f"\n--- 第 {i+1} 轮 ---")

        # 模拟 LLM 输出（实际应调用 LLM API）
        # 此处仅演示框架逻辑
        last_content = messages[-1]["content"] if messages else ""

        # 检查是否包含 Action
        action_match = re.search(r'Action:\s*(.+)', last_content)
        answer_match = re.search(r'Answer:\s*(.+)', last_content)

        if answer_match:
            return answer_match.group(1).strip()

        if action_match:
            action_str = action_match.group(1).strip()
            tool_name, kwargs = parse_action(action_str)

            if tool_name and tool_name in TOOL_REGISTRY:
                result = TOOL_REGISTRY[tool_name](**kwargs)
                observation = f"Observation: {result}"
                messages.append({"role": "assistant", "content": observation})
                print(f"Action: {action_str}")
                print(f"Observation: {result}")
            else:
                observation = f"Observation: 错误 - 未知工具 '{tool_name}'"
                messages.append({"role": "assistant", "content": observation})
        else:
            break

    return "达到最大迭代次数，未能得出答案。"


# ── 演示运行 ──────────────────────────────────────────

if __name__ == "__main__":
    # 示例：手动模拟 ReAct 循环
    print("=== ReAct 智能体演示 ===\n")

    # 第一步：查询北京天气
    result1 = get_weather(city="北京", date="明天")
    print(f"Thought: 需要查询北京明天的天气")
    print(f"Action: get_weather(city='北京', date='明天')")
    print(f"Observation: {result1}\n")

    # 第二步：查询上海天气
    result2 = get_weather(city="上海", date="明天")
    print(f"Thought: 需要查询上海明天的天气")
    print(f"Action: get_weather(city='上海', date='明天')")
    print(f"Observation: {result2}\n")

    # 第三步：计算温差
    result3 = calculate("30 - 26")
    print(f"Thought: 计算北京与上海的温差")
    print(f"Action: calculate('30 - 26')")
    print(f"Observation: {result3}\n")

    print("Answer: 北京明天的气温比上海高 4°C（北京 30°C，上海 26°C）。")
```

> **生产级框架推荐：** 实际项目建议使用 LangChain Agent、LlamaIndex Agent 或 CrewAI 等成熟框架，它们已内置 ReAct/Plan-and-Execute 循环、错误重试、并发工具调用等生产级特性。本文的手写实现旨在帮助理解底层原理。