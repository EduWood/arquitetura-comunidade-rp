-- AlterTable
ALTER TABLE `SessaoJWT` ADD COLUMN `session_id` VARCHAR(255) NOT NULL UNIQUE AFTER `id`;

-- CreateIndex
CREATE INDEX `SessaoJWT_session_id_idx` ON `SessaoJWT`(`session_id`);
