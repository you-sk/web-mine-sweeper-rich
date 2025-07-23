# マインスイーパー

シンプルで美しいWEB版マインスイーパーゲームです。

## 🎮 デモ

[ここをクリックしてプレイ](https://[your-username].github.io/[repository-name]/)

## ✨ 特徴

- **3つの難易度**: 初級（9×9）、中級（16×16）、上級（30×20）
- **美しいUI**: モダンなデザインとスムーズなアニメーション
- **直感的な操作**: マウスの左クリック・右クリックだけでプレイ可能
- **安全な最初のクリック**: 最初にクリックしたマスは必ず地雷ではありません
- **連鎖オープン**: 周囲に地雷がないマスは自動的に開きます

## 🕹️ 操作方法

- **左クリック**: マスを開く
- **右クリック**: 旗を立てる/外す

## 🎯 ゲームルール

1. 地雷が埋まっていないすべてのマスを開くとクリア
2. 地雷のあるマスを開いてしまうとゲームオーバー
3. 数字は周囲8マスにある地雷の数を表します
4. 旗を使って地雷の位置をマークできます

## 🛠️ 技術仕様

- **純粋なHTML/CSS/JavaScript**: 外部ライブラリ不使用
- **レスポンシブデザイン**: 様々な画面サイズに対応
- **単一ファイル構成**: `index.html`のみで動作
- **GitHub Pages対応**: 追加設定不要でホスティング可能

## 📦 ローカルでの実行

1. リポジトリをクローン
```bash
git clone https://github.com/[your-username]/[repository-name].git
```

2. `index.html`をブラウザで開く
```bash
open index.html  # macOS
start index.html # Windows
```

## 🚀 GitHub Pagesでの公開方法

1. このリポジトリをフォーク
2. リポジトリの Settings → Pages へ移動
3. Source を「Deploy from a branch」に設定
4. Branch を「main」または「master」、フォルダを「/ (root)」に設定
5. Save をクリック
6. 数分後、`https://[your-username].github.io/[repository-name]/` でアクセス可能

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

```
MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🤝 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容について議論してください。

## 📝 今後の改善予定

- [ ] タイマー機能の追加
- [ ] ハイスコア記録機能
- [ ] カスタム難易度設定
- [ ] モバイル対応の改善
- [ ] 効果音の追加

---

楽しんでプレイしてください！ 🎮✨