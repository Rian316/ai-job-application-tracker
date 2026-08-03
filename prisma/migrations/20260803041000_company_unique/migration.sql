-- DropIndex
DROP INDEX "companies_userId_name_idx";

-- CreateIndex
CREATE UNIQUE INDEX "companies_userId_name_key" ON "companies"("userId", "name");
