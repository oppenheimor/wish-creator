# 原型先行工作流

本文档约束许愿池所有用户可观察功能的新增与修改。原型用于在正式实现前验证用户流程、界面结构和交互反馈，不代表后端能力已经存在，也不直接复用为生产实现。

## 本地运行

```bash
cd frontend
npm run prototype
```

浏览器会打开 <http://localhost:5173/prototype>。原型工作台只在 Vite 开发环境启用，不进入生产入口。

## 固定顺序

每项用户可观察功能都按以下顺序推进：

1. **明确目标行为**：说明用户目标、关键约束和可验收示例，不凭产品方向猜测具体功能。
2. **更新原型**：在 `frontend/src/prototype/` 中增加或修改对应页面、状态和交互。
3. **验证设计**：检查主要流程、关键状态、移动端行为和文案，记录当前采用的方案。
4. **测试驱动实现**：原型反映目标行为后，再为正式产品代码编写失败测试并进入红、绿、重构循环。
5. **同步收口**：正式实现发生范围变化时，先同步原型，再继续修改生产代码；完成前确认两者表达的用户行为一致。

纯内部重构、工具链维护或不改变用户可观察行为的修复不需要虚构原型页面。只要改动影响页面、流程、状态、文案或用户反馈，就必须先更新原型。

## 目录约定

```text
frontend/src/prototype/
├── PrototypeApp.tsx       # 工作台外壳、URL 状态和画布
├── registry.ts            # 功能页面与方案注册表
├── prototype.css          # 只服务于工作台外壳的样式
└── features/              # 后续按功能建立原型目录
    └── <feature-id>/
        ├── VariantA.tsx
        ├── VariantB.tsx
        └── feature.css
```

不要把具体功能直接堆进 `PrototypeApp.tsx`。每项功能放在独立目录，通过 `registry.ts` 登记。

## 登记一个功能原型

原型组件应使用内存状态和示例数据，不调用真实写接口。将组件加入 `prototypeEntries`：

```tsx
import { ExampleVariantA } from './features/example/VariantA'
import { ExampleVariantB } from './features/example/VariantB'

export const prototypeEntries: PrototypeEntry[] = [
  {
    id: 'example',
    title: '示例功能',
    scope: '一句话说明本轮要验证的用户行为',
    updatedAt: '2026-08-25',
    variants: [
      {
        id: 'A',
        name: '方案 A',
        description: '说明该方案的结构取舍',
        Component: ExampleVariantA,
      },
      {
        id: 'B',
        name: '方案 B',
        description: '说明与方案 A 的关键差异',
        Component: ExampleVariantB,
      },
    ],
  },
]
```

工作台会生成可分享的地址：

```text
/prototype?screen=example&variant=A
```

只有存在真实设计分歧时才增加多个方案。方案之间应在信息结构或主要操作方式上有明显差异，不要只更换颜色。

## 原型完成条件

- 覆盖主流程以及相关的空、加载、错误和完成状态。
- 交互可以在浏览器中操作，不用静态截图代替关键行为。
- 桌面和移动端都有明确布局。
- URL 能定位到具体功能和方案，方便评审与反馈。
- 示例数据明确属于原型，不让人误以为真实能力已经上线。
- 正式实现没有直接复制原型中的临时代码、假数据或无测试逻辑。
