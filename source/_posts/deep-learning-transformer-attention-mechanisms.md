---
title: 深入浅出 Transformer：自注意力机制与位置编码底层原理剖析
date: 2026-09-11 10:00:00
tags:
  - 深度学习
  - Transformer
  - 注意力机制
  - PyTorch
categories:
  - 深度学习
excerpt: 从 RNN 时序瓶颈到 Transformer 全局并行，逐层拆解缩放点积注意力、多头注意力、正余弦位置编码与 RoPE 旋转位置编码的数学原理，并手写 PyTorch 实现。
index_img: /img/posts/default-cover.png
math: true
comments: true
---

## 1、序列建模演进：从 RNN/LSTM 到 Transformer

### 1.1 RNN/LSTM 的时序依赖瓶颈

循环神经网络（RNN）及其变体 LSTM/GRU 通过隐状态 $\mathbf{h}_t = f(\mathbf{h}_{t-1}, \mathbf{x}_t)$ 建模序列依赖。其核心瓶颈在于：

- **串行计算**：$\mathbf{h}_t$ 必须等待 $\mathbf{h}_{t-1}$ 计算完成，无法并行化，训练效率极低。
- **长距离衰减**：梯度在反向传播中需经过 $T$ 步矩阵连乘 $\prod_{i=1}^{T} \frac{\partial \mathbf{h}_i}{\partial \mathbf{h}_{i-1}}$，即使 LSTM 引入门控机制缓解梯度消失，有效记忆窗口仍受限于数百步。

### 1.2 Transformer 的全局并行突破

Transformer（Vaswani et al., 2017）彻底抛弃递归结构，通过**自注意力机制（Self-Attention）** 实现 $O(1)$ 步的全局依赖建模，所有位置的计算完全并行，极大释放 GPU 并行算力。

## 2、缩放点积注意力核心公式详解

### 2.1 核心定义

给定查询矩阵 $\mathbf{Q} \in \mathbb{R}^{n \times d_k}$、键矩阵 $\mathbf{K} \in \mathbb{R}^{n \times d_k}$、值矩阵 $\mathbf{V} \in \mathbb{R}^{n \times d_v}$，缩放点积注意力定义为：

$$\text{Attention}(\mathbf{Q}, \mathbf{K}, \mathbf{V}) = \text{softmax}\left(\frac{\mathbf{Q}\mathbf{K}^T}{\sqrt{d_k}}\right)\mathbf{V}$$

展开为逐元素形式，第 $i$ 个查询的注意力输出为：

$$\text{Attention}(\mathbf{q}_i) = \sum_{j=1}^{n} \frac{\exp(\mathbf{q}_i \cdot \mathbf{k}_j / \sqrt{d_k})}{\sum_{l=1}^{n} \exp(\mathbf{q}_i \cdot \mathbf{k}_l / \sqrt{d_k})} \mathbf{v}_j$$

### 2.2 除以 $\sqrt{d_k}$ 的数学原理

**核心问题：** 为什么需要缩放因子 $\sqrt{d_k}$？

假设 $\mathbf{q}_i$ 和 $\mathbf{k}_j$ 的每个分量独立服从 $\mu=0, \sigma=1$ 的分布，则点积 $\mathbf{q}_i \cdot \mathbf{k}_j = \sum_{l=1}^{d_k} q_{il} \cdot k_{jl}$ 的期望与方差为：

$$E[\mathbf{q}_i \cdot \mathbf{k}_j] = 0, \quad \text{Var}[\mathbf{q}_i \cdot \mathbf{k}_j] = d_k$$

当 $d_k$ 较大时（如 $d_k = 64$，方差为 64，标准差为 8），点积值将广泛分布在 $[-3\sqrt{d_k}, +3\sqrt{d_k}]$ 区间。这导致：

- **Softmax 饱和**：极大值进入 Softmax 后，输出趋近 one-hot（最大值位置接近 1，其余接近 0）。
- **梯度消失**：Softmax 在饱和区的梯度 $\frac{\partial \text{softmax}}{\partial z_i} \approx 0$，反向传播信号几乎消失。

**除以 $\sqrt{d_k}$ 后**，点积的方差被归一化为 1：

$$\text{Var}\left[\frac{\mathbf{q}_i \cdot \mathbf{k}_j}{\sqrt{d_k}}\right] = \frac{d_k}{d_k} = 1$$

这确保 Softmax 输入分布在合理区间，梯度流通畅。

## 3、多头注意力机制（Multi-Head Attention）

多头注意力将 $\mathbf{Q}, \mathbf{K}, \mathbf{V}$ 分别投影到 $h$ 个不同的子空间，各头独立计算注意力后拼接融合：

$$\text{MultiHead}(\mathbf{Q}, \mathbf{K}, \mathbf{V}) = \text{Concat}(\text{head}_1, \ldots, \text{head}_h)\mathbf{W}^O$$

$$\text{head}_i = \text{Attention}(\mathbf{Q}\mathbf{W}_i^Q, \mathbf{K}\mathbf{W}_i^K, \mathbf{V}\mathbf{W}_i^V)$$

其中 $\mathbf{W}_i^Q \in \mathbb{R}^{d_{\text{model}} \times d_k}$，$\mathbf{W}_i^K \in \mathbb{R}^{d_{\text{model}} \times d_k}$，$\mathbf{W}_i^V \in \mathbb{R}^{d_{\text{model}} \times d_v}$，$\mathbf{W}^O \in \mathbb{R}^{hd_v \times d_{\text{model}}}$，且 $d_k = d_v = d_{\text{model}} / h$。

## 4、位置编码：正余弦编码与 RoPE

### 4.1 正余弦位置编码（Sinusoidal Positional Encoding）

Transformer 的注意力计算是置换不变的（permutation invariant），无法感知 token 顺序。正余弦位置编码为每个位置 $pos$ 和维度 $i$ 定义：

$$\text{PE}(pos, 2i) = \sin\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right)$$

$$\text{PE}(pos, 2i+1) = \cos\left(\frac{pos}{10000^{2i/d_{\text{model}}}}\right)$$

**关键性质：** 对于任意固定偏移 $k$，$\text{PE}(pos+k)$ 可表示为 $\text{PE}(pos)$ 的线性变换，使模型能学习相对位置关系。

### 4.2 旋转位置编码（RoPE）

RoPE（Su et al., 2021）将位置信息以旋转矩阵形式直接作用于 $\mathbf{Q}$ 和 $\mathbf{K}$，使内积自然编码相对位置：

$$\langle f(\mathbf{q}_m, m), f(\mathbf{k}_n, n) \rangle = g(\mathbf{q}_m, \mathbf{k}_n, m - n)$$

对于二维情形，位置 $m$ 的旋转编码为：

$$f(\mathbf{x}, m) = \begin{pmatrix} x_1 \cos m\theta - x_2 \sin m\theta \\ x_1 \sin m\theta + x_2 \cos m\theta \end{pmatrix} = \begin{pmatrix} \cos m\theta & -\sin m\theta \\ \sin m\theta & \cos m\theta \end{pmatrix} \begin{pmatrix} x_1 \\ x_2 \end{pmatrix}$$

推广到 $d$ 维，将向量两两分组，每组以不同频率 $\theta_i = 10000^{-2i/d}$ 旋转，实现远程衰减与相对位置感知。

## 5、PyTorch 手写多头注意力核心模块

```python
import torch
import torch.nn as nn
import math

class MultiHeadAttention(nn.Module):
    """手写多头自注意力机制核心实现"""

    def __init__(self, d_model: int = 512, n_heads: int = 8, dropout: float = 0.1):
        super().__init__()
        assert d_model % n_heads == 0, "d_model 必须能被 n_heads 整除"

        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads  # 每个头的维度

        # Q, K, V 的线性投影（合并为一个矩阵提高效率）
        self.W_q = nn.Linear(d_model, d_model, bias=False)
        self.W_k = nn.Linear(d_model, d_model, bias=False)
        self.W_v = nn.Linear(d_model, d_model, bias=False)

        # 输出投影
        self.W_o = nn.Linear(d_model, d_model)

        self.dropout = nn.Dropout(dropout)

    def forward(self, query, key, value, mask=None):
        """
        Args:
            query:  (batch, seq_len_q, d_model)
            key:    (batch, seq_len_k, d_model)
            value:  (batch, seq_len_k, d_model)
            mask:   (batch, 1, seq_len_q, seq_len_k) 可选注意力掩码
        Returns:
            output: (batch, seq_len_q, d_model)
            attn:   (batch, n_heads, seq_len_q, seq_len_k) 注意力权重
        """
        batch_size = query.size(0)

        # 线性投影并拆分多头
        # (batch, seq_len, d_model) -> (batch, seq_len, n_heads, d_k) -> (batch, n_heads, seq_len, d_k)
        Q = self.W_q(query).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        K = self.W_k(key).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)
        V = self.W_v(value).view(batch_size, -1, self.n_heads, self.d_k).transpose(1, 2)

        # 计算缩放点积注意力
        # scores: (batch, n_heads, seq_len_q, seq_len_k)
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)

        # 应用掩码（如因果掩码，将未来位置设为 -inf）
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float('-inf'))

        # Softmax 归一化
        attn = torch.softmax(scores, dim=-1)
        attn = self.dropout(attn)

        # 加权求和
        # context: (batch, n_heads, seq_len_q, d_k)
        context = torch.matmul(attn, V)

        # 拼接多头输出
        # (batch, n_heads, seq_len_q, d_k) -> (batch, seq_len_q, n_heads, d_k) -> (batch, seq_len_q, d_model)
        context = context.transpose(1, 2).contiguous().view(batch_size, -1, self.d_model)

        # 输出投影
        output = self.W_o(context)
        return output, attn


# 验证模块
if __name__ == "__main__":
    mha = MultiHeadAttention(d_model=512, n_heads=8)
    x = torch.randn(2, 10, 512)  # batch=2, seq_len=10, d_model=512
    out, attn_weights = mha(x, x, x)
    print(f"输出形状: {out.shape}")          # (2, 10, 512)
    print(f"注意力权重形状: {attn_weights.shape}")  # (2, 8, 10, 10)
    print(f"注意力权重行和: {attn_weights[0, 0].sum(dim=-1)}")  # 应全为 1.0
```

> **工程提示：** 实际生产中推荐使用 `torch.nn.MultiheadAttention` 或 Flash Attention（`F.scaled_dot_product_attention`），其通过 IO 感知内存分块（Tiling）将注意力计算从 $O(n^2)$ 内存降至 $O(n)$，显著加速长序列推理。