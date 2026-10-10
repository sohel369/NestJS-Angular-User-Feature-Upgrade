#!/bin/bash
set -e

CLUSTER_NAME=${1:-"user-platform-staging-cluster"}
SERVICE_NAME=${2:-"user-platform-backend-service"}
TARGET_TASK_DEF=${3:-""}

echo "=========================================================="
echo "⚠️ INITIATING ONE-CLICK ROLLBACK FOR ECS & DATABASE"
echo "=========================================================="

echo "Target Cluster: $CLUSTER_NAME"
echo "Target Service: $SERVICE_NAME"

# 1. Rollback ECS Service to previous Task Definition
if [ -z "$TARGET_TASK_DEF" ]; then
  echo "🔍 Finding previous stable task definition revision..."
  CURRENT_TASK_DEF=$(aws ecs describe-services --cluster "$CLUSTER_NAME" --services "$SERVICE_NAME" --query "services[0].taskDefinition" --output text)
  FAMILY=$(echo "$CURRENT_TASK_DEF" | cut -d':' -f6 | cut -d'/' -f2)
  REVISION=$(echo "$CURRENT_TASK_DEF" | cut -d':' -f7)
  PREV_REVISION=$((REVISION - 1))
  TARGET_TASK_DEF="$FAMILY:$PREV_REVISION"
fi

echo "🔄 Rolling back ECS service to: $TARGET_TASK_DEF"
aws ecs update-service --cluster "$CLUSTER_NAME" --service "$SERVICE_NAME" --task-definition "$TARGET_TASK_DEF" --force-new-deployment

# 2. Database Migration Revert (if needed)
read -p "Do you also want to revert the latest TypeORM database migration? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "⏪ Reverting latest migration..."
  cd backend
  npm run migration:revert
fi

echo "=========================================================="
echo "✅ ONE-CLICK ROLLBACK COMPLETED SUCCESSFULLY!"
echo "=========================================================="
