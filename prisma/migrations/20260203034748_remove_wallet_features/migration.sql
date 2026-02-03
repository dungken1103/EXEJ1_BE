/*
  Warnings:

  - The values [Wallet] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `wallet` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `wallet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wallet_transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('COD');
ALTER TABLE "order" ALTER COLUMN "payment" TYPE "PaymentMethod_new" USING ("payment"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "PaymentMethod_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "wallet" DROP CONSTRAINT "wallet_userId_fkey";

-- DropForeignKey
ALTER TABLE "wallet_transaction" DROP CONSTRAINT "wallet_transaction_walletId_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "wallet";

-- DropTable
DROP TABLE "wallet";

-- DropTable
DROP TABLE "wallet_transaction";
