-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "SandboxStatus" AS ENUM ('RUNNING', 'STOPPED', 'TIMEOUT', 'ERROR');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL DEFAULT 'javascript',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT,
    "mimeType" TEXT NOT NULL DEFAULT 'text/plain',
    "size" INTEGER NOT NULL DEFAULT 0,
    "isDir" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "tokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snapshots" (
    "id" TEXT NOT NULL,
    "label" TEXT,
    "storageKey" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sandbox_sessions" (
    "id" TEXT NOT NULL,
    "e2bId" TEXT NOT NULL,
    "status" "SandboxStatus" NOT NULL DEFAULT 'RUNNING',
    "language" TEXT NOT NULL DEFAULT 'python',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "projectId" TEXT NOT NULL,

    CONSTRAINT "sandbox_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_executions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "stdout" TEXT,
    "stderr" TEXT,
    "exitCode" INTEGER,
    "durationMs" INTEGER,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sandboxSessionId" TEXT NOT NULL,

    CONSTRAINT "code_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "projects"("userId");

-- CreateIndex
CREATE INDEX "files_projectId_idx" ON "files"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "files_projectId_path_key" ON "files"("projectId", "path");

-- CreateIndex
CREATE INDEX "messages_projectId_idx" ON "messages"("projectId");

-- CreateIndex
CREATE INDEX "snapshots_projectId_idx" ON "snapshots"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "sandbox_sessions_e2bId_key" ON "sandbox_sessions"("e2bId");

-- CreateIndex
CREATE INDEX "sandbox_sessions_projectId_idx" ON "sandbox_sessions"("projectId");

-- CreateIndex
CREATE INDEX "code_executions_sandboxSessionId_idx" ON "code_executions"("sandboxSessionId");

-- CreateIndex
CREATE INDEX "jobs_queue_status_idx" ON "jobs"("queue", "status");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sandbox_sessions" ADD CONSTRAINT "sandbox_sessions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_executions" ADD CONSTRAINT "code_executions_sandboxSessionId_fkey" FOREIGN KEY ("sandboxSessionId") REFERENCES "sandbox_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
