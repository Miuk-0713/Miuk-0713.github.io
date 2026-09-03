---
title: 算法复杂度分析与快速排序实现
date: 2026-09-03 14:00:00
tags:
  - 复杂度
  - Python
  - 基础数据结构
categories:
  - 算法分析
excerpt: 从渐进符号到主定理，系统梳理算法复杂度分析方法，并以快速排序为例展示分治策略与代码实现。
comments: true
math: true
---

## 一、渐进符号体系

算法复杂度分析的核心工具是**渐进符号**，它们描述了函数增长率的上界、下界与紧界：

| 符号 | 含义 | 通俗理解 |
| :--- | :--- | :--- |
| $O(f(n))$ | 渐进上界 | 增长**不超过** $f(n)$ |
| $\Omega(f(n))$ | 渐进下界 | 增长**不低于** $f(n)$ |
| $\Theta(f(n))$ | 渐进紧界 | 增长**恰好**与 $f(n)$ 同阶 |

### 常见复杂度层级

$$
1 \prec \log n \prec \sqrt{n} \prec n \prec n\log n \prec n^2 \prec n^3 \prec 2^n \prec n!
$$

---

## 二、主定理

对于分治递推式：

$$
T(n) = aT\!\left(\frac{n}{b}\right) + O(n^d), \quad a \geq 1,\ b > 1,\ d \geq 0
$$

主定理给出三种情形的封闭解：

$$
T(n) = \begin{cases}
O(n^d) & \text{if } d > \log_b a \\[6pt]
O(n^d \log n) & \text{if } d = \log_b a \\[6pt]
O(n^{\log_b a}) & \text{if } d < \log_b a
\end{cases}
$$

> **直觉**：比较"分解代价" $n^d$ 与"子问题总量" $n^{\log_b a}$，谁大谁主导。

---

## 三、快速排序复杂度分析

快速排序的平均时间复杂度为 $O(n \log n)$，最坏为 $O(n^2)$。

### 平均情况推导

设 $T(n)$ 为对 $n$ 个元素排序的平均比较次数，则：

$$
T(n) = (n-1) + \frac{1}{n}\sum_{k=1}^{n}\bigl[T(k-1) + T(n-k)\bigr]
$$

利用对称性化简：

$$
T(n) = (n-1) + \frac{2}{n}\sum_{k=0}^{n-1}T(k)
$$

经数学归纳可证 $T(n) = O(n \log n)$。

---

## 四、Python 实现

以下是带注释的快速排序实现，采用**三数取中**策略优化 pivot 选择：

```python
import random
from typing import List

def quick_sort(arr: List[int], lo: int = 0, hi: int = None) -> List[int]:
    """快速排序（原地修改），平均 O(n log n)，最坏 O(n^2)"""
    if hi is None:
        hi = len(arr) - 1

    if lo >= hi:
        return arr

    pivot_idx = partition(arr, lo, hi)
    quick_sort(arr, lo, pivot_idx - 1)
    quick_sort(arr, pivot_idx + 1, hi)
    return arr


def median_of_three(arr: List[int], lo: int, hi: int) -> int:
    """三数取中：返回 arr[lo], arr[mid], arr[hi] 中位数的索引"""
    mid = (lo + hi) // 2
    a, b, c = arr[lo], arr[mid], arr[hi]
    if (a <= b <= c) or (c <= b <= a):
        return mid
    if (b <= a <= c) or (c <= a <= b):
        return lo
    return hi


def partition(arr: List[int], lo: int, hi: int) -> int:
    """Lomuto 分区，pivot 选三数取中"""
    pivot_idx = median_of_three(arr, lo, hi)
    arr[pivot_idx], arr[hi] = arr[hi], arr[pivot_idx]

    pivot = arr[hi]
    i = lo
    for j in range(lo, hi):
        if arr[j] <= pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
    arr[i], arr[hi] = arr[hi], arr[i]
    return i


if __name__ == "__main__":
    data = [random.randint(1, 100) for _ in range(20)]
    print("排序前:", data)
    quick_sort(data)
    print("排序后:", data)
```

### 运行示例

```bash
$ python quick_sort.py
排序前: [73, 15, 42, 88, 3, 56, 91, 27, 64, 10, 79, 35, 50, 22, 68, 47, 83, 11, 39, 96]
排序后: [3, 10, 11, 15, 22, 27, 35, 39, 42, 47, 50, 56, 64, 68, 73, 79, 83, 88, 91, 96]
```

---

## 五、复杂度对比

| 排序算法 | 平均 | 最坏 | 空间 | 稳定性 |
| :--- | :--- | :--- | :--- | :--- |
| 快速排序 | $O(n\log n)$ | $O(n^2)$ | $O(\log n)$ | ❌ |
| 归并排序 | $O(n\log n)$ | $O(n\log n)$ | $O(n)$ | ✅ |
| 堆排序 | $O(n\log n)$ | $O(n\log n)$ | $O(1)$ | ❌ |
| 插入排序 | $O(n^2)$ | $O(n^2)$ | $O(1)$ | ✅ |

> **选择建议**：通用场景用快排（常数因子小），需要稳定排序用归并，空间受限用堆排。

---

## 六、总结

- 渐进符号 $O$、$\Omega$、$\Theta$ 是复杂度分析的基石
- 主定理可快速求解形如 $T(n) = aT(n/b) + O(n^d)$ 的分治递推
- 快速排序平均 $O(n\log n)$，三数取中优化可有效避免最坏情况
- 实际工程中应根据数据规模与特征选择合适的排序策略

$$
\boxed{T_{\text{quick}}(n) = O(n\log n) \quad \text{(average case)}}
$$