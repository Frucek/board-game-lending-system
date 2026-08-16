# OpenShift deployment guide

This directory is prepared for the Red Hat OpenShift Developer Sandbox project `frucek-dev`.

## Architecture deployed

- PostgreSQL + PVC -> Game Catalog
- Game Catalog Service -> REST :8081
- Borrowing Service -> gRPC :50051 + SQLite PVC
- User Management Service -> REST :3000 + SQLite PVC + ActiveMQ
- ActiveMQ -> STOMP :61613
- Web BFF -> REST :4000 (internal)
- Mobile BFF -> FastAPI :4001, exposed under `/mobile`
- Shell + 3 React Module Federation micro-frontends
- One public OpenShift Route host:
  - `/` -> shell
  - `/catalog` -> catalog micro-frontend
  - `/borrowing` -> borrowing micro-frontend
  - `/users` -> user-management micro-frontend
  - `/mobile` -> mobile BFF

## Why source changes were necessary

OpenShift runs containers with arbitrary non-root UIDs. The project therefore needed:

1. User SQLite database moved to `/data/users.db` and made configurable.
2. User `/data` directory made group-writable.
3. Frontend nginx changed to an unprivileged nginx image on port 8080.
4. Module Federation URLs changed from localhost ports to same-origin paths.
5. Micro-frontend nginx configs made aware of `/catalog`, `/borrowing`, and `/users` route prefixes.
6. ActiveMQ image tree made group-writable for arbitrary OpenShift UIDs.

## Deployment

From the project root:

```bash
cd board-game-lending-system-main
oc project frucek-dev
./openshift/build-images.sh
./openshift/deploy.sh
```

If your OpenShift project name is different:

```bash
./openshift/build-images.sh YOUR_PROJECT
./openshift/deploy.sh YOUR_PROJECT
```

Builds are deliberately sequential because the free sandbox has limited CPU/RAM.

## Useful commands

```bash
oc get pods
oc get svc
oc get route
oc get pvc
oc get hpa

oc logs deployment/web-bff
oc logs deployment/game-catalog-service
oc logs deployment/borrowing-service
oc logs deployment/user-management-service
oc logs deployment/activemq

oc describe pod POD_NAME
oc rollout restart deployment/web-bff
```

## Testing

After deployment:

1. Open the `shell` route shown by `oc get route`.
2. Test Game Catalog.
3. Create a user.
4. Create a game.
5. Borrow the game.
6. Return the game.
7. Check borrowing history.
8. Test mobile BFF through the same host:
   - `/mobile/games`
   - `/mobile/users/1`
   - `/mobile/users/1/borrowings`

Example:

```bash
HOST="$(oc get route shell -o jsonpath='{.spec.host}')"
curl -k "https://$HOST/mobile/games"
curl -k "https://$HOST/mobile/users/1"
```

## Scaling demonstration

```bash
oc get hpa
oc scale deployment/web-bff --replicas=2
oc get pods -l app=web-bff
```

The HPA is intentionally capped at 2 replicas for the free sandbox.

## Optional network security

After everything works:

```bash
oc apply -f openshift/05-networkpolicy-optional.yaml
oc get networkpolicy
```

If this causes probe/router problems in your specific sandbox, remove it:

```bash
oc delete networkpolicy default-deny-except-app
```

## Assignment evidence to capture

Take screenshots / save command output showing:

- OpenShift Topology with all services.
- Running pods.
- Routes and application URL.
- PVCs.
- HPA.
- ConfigMap and Secret.
- Successful application workflow.
- `oc get pods` with all workloads Running.
- `oc logs` showing BFF-to-service communication.
- Git repository containing `openshift/` manifests and scripts.

## Important

`activemq-listener/` is not deployed because the supplied docker-compose.yml does not include it and the listener is not required by the user-management service's publish/outbox flow. It can be added later as a separate consumer deployment if your lecturer expects it.
