# Gatekeep - Secure Full-Stack JWT Authentication Portal

Gatekeep is a secure, modern full-stack Login/Logout application engineered with a monorepo architecture using **React (Vite + TypeScript)** for the frontend, **Node.js (Express + TypeScript)** for the backend, and **MySQL (AWS RDS)** for the database layer.

---

## 🚀 Key Features

*   **Secure Session Authentication:** Implements stateless **JSON Web Tokens (JWT)** for session validation.
*   **Cryptographic Password Hashing:** User passwords are salted and hashed using **bcrypt** (via `bcryptjs` with a work factor of 10) prior to database insertion.
*   **Client Route Protection:** Encapsulated React components (`ProtectedRoute`) guard authentic pages and handle unauthorized redirection.
*   **Automatic Session Restoration:** Automatically verifies active sessions by retrieving stored JWTs on load and contacting the backend `/api/auth/me` endpoint.
*   **SQL Injection Mitigation:** Deploys query parameters and parameter binding exclusively across all MySQL operations.
*   **Modern Visual Aesthetics:** A responsive, dark-mode user interface featuring glassmorphic panel controls, active field focus states, password visibility toggles, and live session status monitoring.

---

## 📂 Project Structure

```
gatekeep/
├── client/                 # React (Vite + TS) Application
│   ├── src/
│   │   ├── components/     # UI Components (Login, Register, Dashboard, ProtectedRoute)
│   │   ├── context/        # React Context Providers (AuthContext)
│   │   ├── App.tsx         # Main router and route definitions
│   │   ├── index.css       # Premium CSS styling system (Dark theme, glassmorphism)
│   │   └── main.tsx        # React mounting entry point
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express (Node.js + TS) Backend
│   ├── src/
│   │   ├── config/         # Database connection pool settings (db.ts)
│   │   ├── controllers/    # Route controllers (authController.ts)
│   │   ├── middleware/     # JWT authentication parser (auth.ts)
│   │   ├── routes/         # Router paths (authRoutes.ts)
│   │   ├── index.ts        # App bootstrapper
│   │   └── types.ts        # TypeScript Request interface extensions
│   ├── package.json
│   └── tsconfig.json
├── database/               # SQL Schemas
│   └── schema.sql          # MySQL tables schema + bcrypt usage notes
└── package.json            # Root monorepo workspace configurations
```

---

## 🛠️ Installation & Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
*   [MySQL](https://www.mysql.com/) (Local server or AWS RDS instance)

### AWS MySQL RDS Database Setup (Recommended)
If you want to host your database in the cloud using Amazon Web Services (AWS) Relational Database Service (RDS):

1. **Create Instance:**
   - Log in to the **AWS Console** and search for **RDS**.
   - Click **Create database** -> Choose **Standard create** -> select **MySQL**.
   - Select **Free Tier** under templates (uses `db.t3.micro`/`db.t4g.micro` with 20GB storage, which is free for the first 12 months).
   - Enter a **DB instance identifier** (e.g., `gatekeep-db-mysql`).
   - Define a **Master username** (e.g., `admin`) and a secure **Master password**. (Save these).

2. **Configure Connectivity (Crucial for remote access):**
   - Under *Connectivity*, select your VPC (Default VPC is recommended for simple testing).
   - Set **Publicly accessible** to **Yes**. *(This instructs AWS to assign a public IP address to the database).*
   - Set **VPC security group** to **Create new** and give it a name (e.g., `gatekeep-rds-sg`).
   - Under *Additional configuration*, enter `gatekeep_db` in **Initial database name**.
   - Click **Create database** (Takes 2–5 minutes until status becomes `Available`).

3. **Open Inbound Port (Firewall):**
   - Click on your created database instance -> Look under the **Connectivity & security** tab.
   - Click the link under **VPC security groups**.
   - Select the group -> click **Inbound rules** -> click **Edit inbound rules**.
   - Add a rule:
     - **Type:** `MySQL/Aurora` (Port `3306`)
     - **Source:** Select **My IP** (secure, only allows your current location) or **Anywhere-IPv4** (`0.0.0.0/0` - allows connection from any hosting service).
   - Save the rules.

4. **Retrieve Connection Endpoint:**
   - Go back to RDS Database details -> copy the **Endpoint** address (e.g., `gatekeep-db-mysql.xxxxxx.us-east-1.rds.amazonaws.com`). Use this as `DB_HOST` in your server `.env` configuration.

### 1. Repository Setup
Clone the repository and install all workspace dependencies from the root directory:
```bash
# Installs dependencies for root, client, and server workspaces in one step
npm install
```

### 2. Database Schema Import
Run the schema definitions against your MySQL server to initialize the database:
```bash
# If using a local MySQL server:
mysql -u root -p < database/schema.sql

# If using an AWS RDS instance (replace host and user parameters):
mysql -h <rds-endpoint> -P 3306 -u <master-user> -p < database/schema.sql
```

### 3. Server Configuration
Create a `.env` file in the `server/` directory by copying the template:
```bash
cp server/.env.example server/.env
```
Open [server/.env](server/.env) and populate it with your database and JWT secret configurations:
```env
PORT=5000
DB_HOST=your-mysql-host (e.g. 127.0.0.1 or rds-endpoint.amazonaws.com)
DB_PORT=3306
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=gatekeep_db
JWT_SECRET=use-a-strong-custom-passphrase
JWT_EXPIRES_IN=24h
```

---

## ⚡ Running the Application

Start the development environments for both the Express server and Vite React client concurrently:

```bash
# From the root directory
npm run dev
```

*   **Vite React Frontend:** [http://localhost:5173](http://localhost:5173)
*   **Express Auth API:** [http://localhost:5000](http://localhost:5000)
*   **API Health Status:** [http://localhost:5000/health](http://localhost:5000/health)

---

## 🔒 Security Implementations

1.  **CORS Hardening:** Configured in `server/src/index.ts` to only accept connections from the client origins with credentials (cookies/auth headers) allowed.
2.  **Stateless Session Validation:** JWTs are issued upon login with a preset expiration period (`JWT_EXPIRES_IN`). Token validity is parsed cryptographically without querying the database for every action, optimizing processing time.
3.  **Encrypted Sign-up Passwords:** Hashes plain-text passwords using a cryptographically secure hash function (`bcryptjs`) before saving to persistent storage.
4.  **Database Protection:** Prevents SQL Injection attacks by compiling prepared statements and binding request payloads to SQL placeholders.

---

## ☸️ Helm Deployment

The application can also be deployed to a Kubernetes cluster using the Helm chart. The Helm chart repository is hosted separately at:
🔗 **[gatekeep-chart Repository](https://github.com/MangeshGot/gatekeep-chart)**

For instructions on how to use, configure, and install the Helm chart, please refer to the `README.md` in the **gatekeep-chart** repository.

---

## ☸️ Kubernetes & EKS Deployment Troubleshooting

### AWS ALB Ingress: "failed to refresh cached credentials, no EC2 IMDS role found"

If you deploy the application using the [ingress.yaml](file:///home/mangesh/Documents/gatekeep/k8s/ingress.yaml) configuration on AWS EKS and notice that the Application Load Balancer (ALB) is not being provisioned (its `ADDRESS` column remains empty), check the logs of your controller pods:
```bash
kubectl logs -n kube-system deployment/aws-load-balancer-controller --tail=100
```
If you see the error:
`failed to refresh cached credentials, no EC2 IMDS role found`

#### **Reason**:
The `aws-load-balancer-controller` pods run under a ServiceAccount of the same name in the `kube-system` namespace. If EKS Pod Identity is enabled, the EKS Pod Identity Agent needs an explicit **Association** mapping that ServiceAccount to the IAM Role containing the load balancer controller permissions. If it's missing, the controller cannot authenticate to AWS.

#### **Solution**:
Create the missing Pod Identity Association for the controller using the AWS CLI:

```bash
aws eks create-pod-identity-association \
  --cluster-name <your-cluster-name> \
  --namespace kube-system \
  --service-account aws-load-balancer-controller \
  --role-arn arn:aws:iam::<your-account-id>:role/<your-pod-identity-role> \
  --region <your-region>
```

Then, restart the load balancer controller deployment to apply the new credentials:
```bash
kubectl rollout restart deployment -n kube-system aws-load-balancer-controller
```

---

## 🔐 AWS Secrets Manager Integration via External Secrets Operator (ESO) & IRSA

This section explains how to integrate AWS Secrets Manager with your EKS cluster using **External Secrets Operator (ESO)** and **IRSA (IAM Roles for Service Accounts)**.

### 1. Register OIDC Provider (if missing)

Ensure your EKS cluster has an IAM OIDC provider associated with it:

```bash
eksctl utils associate-iam-oidc-provider \
  --cluster mangesh-cluster \
  --region us-east-1 \
  --approve
```

---

### 2. IAM Role & Trust Relationship Configuration

Create an IAM Role (`ESO-IRSA-Role`) with a trust policy allowing the Kubernetes ServiceAccount (`external-secrets-sa`) in the `external-secrets` namespace to assume the role via OIDC web identity:

**Trust Policy JSON (`Trust-Policy.json`):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::570197775598:oidc-provider/oidc.eks.us-east-1.amazonaws.com/id/CF02F5C42C89697E713845CE60B4B2AC"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.us-east-1.amazonaws.com/id/CF02F5C42C89697E713845CE60B4B2AC:sub": "system:serviceaccount:external-secrets:external-secrets-sa",
          "oidc.eks.us-east-1.amazonaws.com/id/CF02F5C42C89697E713845CE60B4B2AC:aud": "sts.amazonaws.com"
        }
      }
    }
  ]
}
```

**Permissions Policy:** Attach an IAM policy granting `secretsmanager:GetSecretValue` permissions for your target secrets.

---

### 3. Deploying External Secrets Operator via Helm

**`helm-secret.yaml` Values Configuration:**

```yaml
installCRDs: true
serviceAccount:
  create: true
  name: external-secrets-sa
  annotations:
    eks.amazonaws.com/role-arn: "arn:aws:iam::570197775598:role/ESO-IRSA-Role"
```

**Install / Upgrade Command:**

```bash
helm upgrade --install external-secrets external-secrets/external-secrets \
  -n external-secrets \
  --create-namespace \
  -f helm-secret.yaml
```

---

### 4. Applying the SecretStore

When using IRSA, the AWS SDK auto-discovers mounted token environment variables (`AWS_ROLE_ARN` and `AWS_WEB_IDENTITY_TOKEN_FILE`), so an explicit `auth` block inside the `SecretStore` is optional.

**`secretstore.yaml`:**

```yaml
apiVersion: external-secrets.io/v1
kind: SecretStore
metadata:
  name: aws-secret-manager-store
  namespace: external-secrets
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
```

**Apply and Verify:**

```bash
kubectl apply -f secretstore.yaml

# Check status (Should show STATUS: Valid and READY: True)
kubectl get secretstore aws-secret-manager-store -n external-secrets
```

---

### 5. Creating the ExternalSecret

Maps keys from AWS Secrets Manager (`myawssecrete`) into a Kubernetes Secret (`myawssecrete-k8s`).

**`externalsecret.yaml`:**

```yaml
apiVersion: external-secrets.io/v1
kind: ExternalSecret
metadata:
  name: my-aws-external-secret
  namespace: external-secrets
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secret-manager-store
    kind: SecretStore
  target:
    name: myawssecrete-k8s
    creationPolicy: Owner
  data:
    - secretKey: aws_repo_url
      remoteRef:
        key: myawssecrete
        property: aws_repo_url
    - secretKey: host
      remoteRef:
        key: myawssecrete
        property: host
    - secretKey: password
      remoteRef:
        key: myawssecrete
        property: password
```

**Apply and Verify:**

```bash
kubectl apply -f externalsecret.yaml

# Confirm synchronization status
kubectl get externalsecret my-aws-external-secret -n external-secrets
kubectl get secret myawssecrete-k8s -n external-secrets
```

---

### 6. GitOps Integration with ArgoCD & Helm (`gatekeep-chart`)

**ArgoCD Application Manifest (`application.yaml`):**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: gatekeep-app
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: 'https://github.com/MangeshGot/gatekeep-chart.git'
    targetRevision: HEAD
    path: '.'
    helm:
      valueFiles:
        - values.yaml
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: gatekeep
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

**Referencing Synced Secrets in Container Workloads:**

In your backend deployment manifest (`templates/backend-deployment.yaml`), pull secret values directly from the generated Kubernetes secret:

```yaml
env:
  - name: DB_PORT
    value: {{ .Values.db.port | quote }}
  - name: DB_USER
    value: {{ .Values.db.user | quote }}
  - name: DB_NAME
    value: {{ .Values.db.name | quote }}
  - name: DB_HOST
    valueFrom:
      secretKeyRef:
        name: {{ .Values.externalSecret.k8sSecretName }}
        key: host
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: {{ .Values.externalSecret.k8sSecretName }}
        key: password
```

---

### 7. Troubleshooting & Verification Matrix

| Issue / Error | Root Cause | Solution |
| :--- | :--- | :--- |
| `no matches for kind "SecretStore"` | Outdated API version or missing CRDs | Use `apiVersion: external-secrets.io/v1` or install CRDs (`installCRDs: true`) |
| `InvalidIdentityToken` | Missing OIDC Provider in AWS IAM | Run `eksctl utils associate-iam-oidc-provider` |
| `InvalidProviderConfig` | Mismatched Trust Policy or missing Pod restarting | Verify IAM Trust Policy `:sub` claim & run `kubectl rollout restart deployment` |


