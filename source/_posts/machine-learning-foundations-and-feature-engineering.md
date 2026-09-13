---
title: 经典机器学习核心算法与工业级特征工程深度指南
date: 2026-09-11 14:00:00
tags:
  - 机器学习
  - XGBoost
  - 特征工程
  - 树模型
  - Scikit-learn
categories:
  - 机器学习
excerpt: 系统梳理特征工程核心手法（缺失值、分箱、Target Encoding），推演树模型从决策树到 XGBoost/LightGBM 的演进路径与目标函数泰勒二阶展开优化，给出基于 Scikit-learn Pipeline 与 LightGBM 的工业级全流程代码。
index_img: /img/posts/default-cover.png
math: true
comments: true
---

## 1、特征工程的核心价值

在工业机器学习中，**特征工程（Feature Engineering）** 对模型效果的影响往往超过模型选择本身。正如吴恩达所言：「Applied machine learning is basically feature engineering.」

### 1.1 缺失值处理

| 策略 | 适用场景 | 实现方式 |
|------|----------|----------|
| **均值/中位数填充** | 数值特征，缺失比例低 | `SimpleImputer(strategy='median')` |
| **众数填充** | 类别特征 | `SimpleImputer(strategy='most_frequent')` |
| **标记缺失 + 极值填充** | 缺失本身有信息量（如「未填写」暗示某种行为） | 新增 `is_missing` 列 + 填充 -999 |
| **模型预测填充** | 缺失比例高且与其他特征相关 | 用其他特征训练模型预测缺失值 |

```python
import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer

# 标记缺失 + 极值填充策略
def missing_indicator_fill(df, column, fill_value=-999):
    df[f"{column}_missing"] = df[column].isnull().astype(int)
    df[column] = df[column].fillna(fill_value)
    return df
```

### 1.2 连续特征分箱与离散化

分箱将连续变量转化为有序类别，引入非线性能力并增强模型鲁棒性：

```python
from sklearn.preprocessing import KBinsDiscretizer

# 等频分箱（每个箱内样本数大致相同）
discretizer = KBinsDiscretizer(
    n_bins=10,
    encode="ordinal",     # 输出为箱编号 0, 1, ..., 9
    strategy="quantile",  # 等频分箱
    subsample=200000,
)
age_binned = discretizer.fit_transform(df[["age"]])
```

### 1.3 高维稀疏特征编码

**Target Encoding（目标编码）**

对于高基数类别特征（如用户 ID、城市名），One-Hot 编码会导致维度爆炸。Target Encoding 用目标变量的条件均值替代类别值：

$$\text{TE}(c) = \frac{n_c \cdot \mu_c + m \cdot \mu_{\text{global}}}{n_c + m}$$

其中 $n_c$ 为类别 $c$ 的样本数，$\mu_c$ 为类别 $c$ 的目标均值，$\mu_{\text{global}}$ 为全局目标均值，$m$ 为平滑参数。

```python
def target_encode(df, column, target, m=10):
    """带平滑的 Target Encoding"""
    global_mean = df[target].mean()
    stats = df.groupby(column)[target].agg(["count", "mean"])
    counts, means = stats["count"], stats["mean"]
    smoothed = (counts * means + m * global_mean) / (counts + m)
    return df[column].map(smoothed)
```

> **注意：** Target Encoding 必须在交叉验证的训练折叠内计算，否则会导致**目标泄露（Target Leakage）**，严重过拟合。

## 2、树模型演进路径

### 2.1 决策树 → 随机森林（Bagging） → GBDT → XGBoost/LightGBM（Boosting）

```
决策树 (CART)
    │
    ├── Bagging 思想: 多棵树投票/平均，降低方差
    │   └── 随机森林: 行采样 + 列采样 + 多棵树并行
    │
    └── Boosting 思想: 串行拟合残差，降低偏差
        ├── GBDT: 梯度下降拟合负梯度（残差）
        ├── XGBoost: 二阶泰勒展开 + 正则化 + 列采样
        └── LightGBM: 直方图加速 + Leaf-wise 生长 + GOSS + EFB
```

| 模型 | 核心改进 | 偏差/方差 | 并行性 |
|------|----------|-----------|--------|
| 随机森林 | Bagging + 行列采样 | 降方差 | 树级并行 |
| GBDT | 串行拟合负梯度 | 降偏差 | 无 |
| XGBoost | 二阶泰勒 + $L_1/L_2$ 正则 | 降偏差 | 特征级并行 |
| LightGBM | 直方图 + Leaf-wise | 降偏差 | 特征级并行 |

## 3、XGBoost 目标函数泰勒二阶展开优化原理

### 3.1 目标函数定义

XGBoost 的第 $t$ 轮目标函数为：

$$\mathcal{L}^{(t)} = \sum_{i=1}^{n} l(y_i, \hat{y}_i^{(t-1)} + f_t(\mathbf{x}_i)) + \Omega(f_t)$$

其中正则化项：

$$\Omega(f) = \gamma T + \frac{1}{2}\lambda \sum_{j=1}^{T} w_j^2$$

$T$ 为叶节点数，$w_j$ 为叶节点权重，$\gamma$ 和 $\lambda$ 为正则化系数。

### 3.2 泰勒二阶展开

对损失函数 $l$ 在 $\hat{y}_i^{(t-1)}$ 处做二阶泰勒展开：

$$l(y_i, \hat{y}_i^{(t-1)} + f_t(\mathbf{x}_i)) \approx l(y_i, \hat{y}_i^{(t-1)}) + g_i f_t(\mathbf{x}_i) + \frac{1}{2} h_i f_t^2(\mathbf{x}_i)$$

其中：

$$g_i = \frac{\partial l(y_i, \hat{y}_i^{(t-1)})}{\partial \hat{y}_i^{(t-1)}}, \quad h_i = \frac{\partial^2 l(y_i, \hat{y}_i^{(t-1)})}{\partial (\hat{y}_i^{(t-1)})^2}$$

去掉常数项 $l(y_i, \hat{y}_i^{(t-1)})$ 后：

$$\tilde{\mathcal{L}}^{(t)} = \sum_{i=1}^{n} \left[ g_i f_t(\mathbf{x}_i) + \frac{1}{2} h_i f_t^2(\mathbf{x}_i) \right] + \gamma T + \frac{1}{2}\lambda \sum_{j=1}^{T} w_j^2$$

### 3.3 最优叶节点权重与目标函数值

定义 $G_j = \sum_{i \in I_j} g_i$，$H_j = \sum_{i \in I_j} h_i$（叶节点 $j$ 上的一阶/二阶梯度之和），对 $w_j$ 求导令其为零得：

$$w_j^* = -\frac{G_j}{H_j + \lambda}$$

代入得最优目标函数值：

$$\tilde{\mathcal{L}}^* = -\frac{1}{2} \sum_{j=1}^{T} \frac{G_j^2}{H_j + \lambda} + \gamma T$$

**该值用于分裂增益计算：** 分裂前后的增益为：

$$\text{Gain} = \frac{1}{2} \left[ \frac{G_L^2}{H_L + \lambda} + \frac{G_R^2}{H_R + \lambda} - \frac{(G_L + G_R)^2}{H_L + H_R + \lambda} \right] - \gamma$$

当 $\text{Gain} > 0$ 时执行分裂，$\gamma$ 作为分裂阈值起到**预剪枝**作用。

## 4、工业级二分类预测模型全流程

```python
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.metrics import roc_auc_score, classification_report
import lightgbm as lgb

# ── 1. 数据加载与划分 ──────────────────────────────────

df = pd.read_csv("train.csv")
target = "is_default"
features = [c for c in df.columns if c != target]

# 自动识别特征类型
num_features = df[features].select_dtypes(include="number").columns.tolist()
cat_features = df[features].select_dtypes(exclude="number").columns.tolist()

# ── 2. 预处理 Pipeline ────────────────────────────────

num_transformer = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
])

cat_transformer = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=True)),
])

preprocessor = ColumnTransformer([
    ("num", num_transformer, num_features),
    ("cat", cat_transformer, cat_features),
])

# ── 3. LightGBM 模型定义 ──────────────────────────────

lgb_params = {
    "objective": "binary",
    "metric": "auc",
    "boosting_type": "gbdt",
    "num_leaves": 63,
    "max_depth": -1,
    "learning_rate": 0.05,
    "feature_fraction": 0.8,    # 列采样
    "bagging_fraction": 0.8,    # 行采样
    "bagging_freq": 5,
    "reg_alpha": 0.1,           # L1 正则
    "reg_lambda": 1.0,          # L2 正则
    "min_child_samples": 20,
    "verbose": -1,
    "n_jobs": -1,
    "random_state": 42,
}

# ── 4. 交叉验证训练 ───────────────────────────────────

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
oof_preds = np.zeros(len(df))
test_preds = []

for fold, (train_idx, val_idx) in enumerate(skf.split(df, df[target])):
    print(f"\n===== Fold {fold + 1} =====")

    X_train, y_train = df.iloc[train_idx][features], df.iloc[train_idx][target]
    X_val, y_val = df.iloc[val_idx][features], df.iloc[val_idx][target]

    # LightGBM 原生类别特征支持（无需 One-Hot）
    train_data = lgb.Dataset(
        X_train, label=y_train, categorical_feature=cat_features
    )
    val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)

    model = lgb.train(
        lgb_params,
        train_data,
        num_boost_round=1000,
        valid_sets=[val_data],
        callbacks=[
            lgb.early_stopping(stopping_rounds=50),
            lgb.log_evaluation(period=100),
        ],
    )

    oof_preds[val_idx] = model.predict(X_val, num_iteration=model.best_iteration)
    print(f"Fold {fold+1} AUC: {roc_auc_score(y_val, oof_preds[val_idx]):.5f}")

# ── 5. 全局评估 ───────────────────────────────────────

overall_auc = roc_auc_score(df[target], oof_preds)
print(f"\n整体 OOF AUC: {overall_auc:.5f}")

# ── 6. 特征重要性 ─────────────────────────────────────

importance = model.feature_importance(importance_type="gain")
feat_imp = pd.DataFrame({
    "feature": features,
    "importance": importance,
}).sort_values("importance", ascending=False)

print("\nTop-10 重要特征:")
print(feat_imp.head(10).to_string(index=False))
```

> **工程最佳实践：** (1) LightGBM 原生支持类别特征，无需 One-Hot 编码，直接传入 `categorical_feature` 参数即可；(2) 使用 `early_stopping` 防止过拟合；(3) OOF（Out-of-Fold）预测用于评估泛化性能和构建 Stacking 集成；(4) 生产部署时保存 `model.save_model("model.lgb")`，推理时 `lgb.Booster(model_file="model.lgb")` 加载。