#!/usr/bin/env bash
set -euo pipefail

PROJECT="${1:-frucek-dev}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

oc project "$PROJECT"

echo "Applying OpenShift build configurations..."
oc apply -f "$ROOT/openshift/01-buildconfigs.yaml"

build() {
  local name="$1"
  local dir="$2"
  echo
  echo "===== Building $name from $dir ====="
  oc start-build "$name" --from-dir="$ROOT/$dir" --follow
}

Build sequentially to avoid exhausting the free sandbox quota.
build game-catalog-service game-catalog-service
build borrowing-service borrowing-service
build user-management-service user-management-service
build web-bff web-bff
build mobile-bff mobile-bff
build activemq activemq
build shell frontend/shell
build catalog-mf frontend/catalog-mf
build borrowing-mf frontend/borrowing-mf
build user-management-mf frontend/user-management-mf

echo
echo "All images built."
oc get is
