---
title: 基于 LangChain 与 RAG 架构的企业级私有知识库开发实战
date: 2026-09-11 09:00:00
tags:
  - LangChain
  - RAG
  - 向量数据库
  - 知识库
  - Python
categories:
  - 大模型应用开发
excerpt: 从 RAG 核心痛点出发，系统讲解文档解析切分、向量化存储、LCEL 检索增强问答链构建，以及 Hybrid Search + Rerank 生产级优化方案。
index_img: /img/posts/default-cover.png
math: false
comments: true
---

## 1、RAG 核心痛点与行业背景

大语言模型（LLM）虽具备强大的通用推理与生成能力，但在企业落地中面临两大核心痛点：

- **幻觉问题（Hallucination）**：模型在缺乏事实依据时倾向编造看似合理但实际错误的内容，对企业知识场景（合同条款、技术规范）造成严重风险。
- **私域数据时效性**：LLM 的知识截止于训练数据，无法感知企业内部最新文档、实时业务数据或近期政策变更。

**检索增强生成（Retrieval-Augmented Generation, RAG）** 的核心思想是：在生成回答前，先从外部知识库中检索与用户问题相关的事实片段，将其注入 LLM 的上下文窗口，使模型的回答「有据可依」。

```
用户 Query
    ↓
[检索器 Retriever] → 从知识库召回 Top-K 相关文档片段
    ↓
[构建 Prompt] = System Prompt + 检索上下文 + User Query
    ↓
[LLM Generator] → 基于增强上下文生成回答
```

## 2、文档解析与切分策略

### 2.1 文档加载

企业知识库的原始数据格式多样（PDF、Word、Markdown、HTML），LangChain 提供了统一的 Loader 抽象：

```python
from langchain_community.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    UnstructuredMarkdownLoader,
    DirectoryLoader,
)

# 批量加载目录下所有 PDF
pdf_loader = DirectoryLoader(
    path="./knowledge_base/",
    glob="**/*.pdf",
    loader_cls=PyPDFLoader,
    show_progress=True,
)
docs = pdf_loader.load()
print(f"共加载 {len(docs)} 个文档页/片段")
```

### 2.2 RecursiveCharacterTextSplitter 分块优化

文档切分是 RAG 效果的关键前置环节。切分粒度过粗会导致检索噪声过大，过细则丢失上下文语义完整性。

**针对中英文混合文本的优化配置：**

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,          # 每个分块的目标字符数
    chunk_overlap=64,        # 相邻分块重叠字符数，保证语义连续
    separators=["\n\n", "\n", "。", "！", "？", ".", "!", "?", " ", ""],
    length_function=len,
)

chunks = splitter.split_documents(docs)
print(f"切分后共 {len(chunks)} 个知识片段")
```

**关键设计考量：**

| 参数 | 推荐值 | 说明 |
|------|--------|------|
| `chunk_size` | 384–768 | 中文单字信息密度高，宜比英文略小 |
| `chunk_overlap` | chunk_size × 10%–15% | 过大则冗余，过小则语义断裂 |
| `separators` | 优先按段落/句子/标点 | 中文句号、问号、叹号作为切分边界 |

## 3、向量化 Embedding 与向量数据库

### 3.1 Embedding 模型选型

```python
from langchain_community.embeddings import HuggingFaceEmbeddings

# 使用支持中英文的开源 Embedding 模型
embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-large-zh-v1.5",
    model_kwargs={"device": "cuda"},
    encode_kwargs={"normalize_embeddings": True},  # L2 归一化，余弦相似度等价于内积
)
```

**相似度计算原理：** 归一化后的向量 $\mathbf{e}_q$ 和 $\mathbf{e}_d$ 的余弦相似度：

$$\text{sim}(\mathbf{e}_q, \mathbf{e}_d) = \frac{\mathbf{e}_q \cdot \mathbf{e}_d}{\|\mathbf{e}_q\| \|\mathbf{e}_d\|} = \mathbf{e}_q \cdot \mathbf{e}_d$$

### 3.2 向量存储（Chroma / FAISS）

```python
from langchain_community.vectorstores import Chroma

# 构建向量库并持久化
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db",
)
vectorstore.persist()

# 相似度检索
results = vectorstore.similarity_search_with_score(
    query="如何配置 LoRA 微调参数？",
    k=5,
)
for doc, score in results:
    print(f"[相似度: {score:.4f}] {doc.page_content[:100]}...")
```

## 4、基于 LCEL 构建端到端检索增强问答链

LangChain Expression Language（LCEL）是 LangChain 推荐的声明式链构建范式，支持流式输出、批处理和异步原生支持。

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_community.llms import Ollama

# 定义检索器
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# 定义 Prompt 模板
prompt = ChatPromptTemplate.from_template("""你是一个专业的企业知识库助手。请严格根据以下检索到的上下文内容回答用户问题。如果上下文中不包含相关信息，请明确回答"根据现有知识库无法回答该问题"。

检索上下文：
{context}

用户问题：{question}

请给出准确、完整的回答：""")

# 初始化 LLM
llm = Ollama(model="qwen2.5:7b", temperature=0.1)

# 构建 LCEL 链
def format_docs(docs):
    return "\n\n---\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# 执行查询
answer = rag_chain.invoke("公司数据保留策略的最低期限是多少？")
print(answer)
```

## 5、进阶生产优化：Hybrid Search + Rerank

### 5.1 混合检索（Hybrid Search）

单一密集向量检索在**精确关键词匹配**场景（如产品编号、专有名词）上表现不佳。混合检索结合 BM25 稀疏检索与密集向量检索，兼顾语义匹配与精确匹配：

```python
from langchain.retrievers import BM25Retriever, EnsembleRetriever

# 稀疏检索：BM25 基于词频的精确匹配
bm25_retriever = BM25Retriever.from_documents(chunks, k=4)

# 密集检索：向量语义相似度
dense_retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# 混合检索：加权融合（权重之和为 1.0）
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, dense_retriever],
    weights=[0.4, 0.6],  # BM25 权重 0.4，向量检索权重 0.6
)
```

### 5.2 Rerank 重排序

混合检索返回的候选集可能包含大量低相关度文档，需要通过 Cross-Encoder 重排序模型精排：

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder

# 加载重排序模型
cross_encoder = HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-v2-m3")

# 构建压缩检索器
compressor = CrossEncoderReranker(
    model=cross_encoder,
    top_n=3,  # 重排后保留 Top-3
)
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=ensemble_retriever,
)

# 使用重排序检索器替换原检索器
rag_chain_advanced = (
    {"context": compression_retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)
```

### 5.3 完整生产级架构

```
用户 Query
    ↓
┌─────────────────────────────┐
│     Hybrid Retriever        │
│  BM25 (稀疏) + Dense (密集) │
└──────────┬──────────────────┘
           ↓ Top-K 候选集
┌─────────────────────────────┐
│   Cross-Encoder Reranker    │
│   精排 → Top-N 高质量片段   │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│   Prompt 构建 + LLM 生成    │
│   上下文注入 + 答案生成     │
└─────────────────────────────┘
```

> **生产建议：** 对于企业级部署，建议将向量库替换为 Milvus 或 Weaviate 以支持亿级向量检索，Rerank 模型可部署为独立微服务以降低推理延迟。