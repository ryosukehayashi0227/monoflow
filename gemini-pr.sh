#!/bin/bash

# 1. すべての変更をステージングに上げる
echo "📂 すべての変更をステージングに追加中..."
git add .

# 2. 差分があるか確認
if git diff --cached --quiet; then
  echo "⚠️ 変更が見つかりませんでした。終了します。"
  exit 0
fi

# 3. Geminiにコミットメッセージを生成させる
echo "🤖 Geminiが変更内容を分析してメッセージを生成中..."
COMMIT_MSG=$(git diff --cached | gemini "以下のdiffに基づき、Conventional Commits形式で1行のコミットメッセージを作成してください。余計な解説は不要です。")

# 4. コミット実行
echo "📝 コミット中: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# 5. 現在のブランチ名を取得してプッシュ
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
echo "🚀 $BRANCH_NAME をプッシュ中..."
git push origin "$BRANCH_NAME"

# 6. PRの作成
echo "📄 GitHubでプルリクエストを作成中..."
PR_BODY=$(git diff main...HEAD | gemini "この差分に基づき、GitHubのプルリクエスト用の説明文を日本語のMarkdown形式で作成してください。")

gh pr create --title "$COMMIT_MSG" --body "$PR_BODY"

echo "✅ すべての工程が完了しました！"