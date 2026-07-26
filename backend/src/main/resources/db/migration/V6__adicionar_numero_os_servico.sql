-- Migration V6: Adicionar campo numero_os na tabela servico
ALTER TABLE servico ADD COLUMN numero_os VARCHAR(50);

-- Definir número de OS padrão para serviços legados (caso existam)
UPDATE servico SET numero_os = 'OS-' || id WHERE numero_os IS NULL;

-- Tornar a coluna NOT NULL
ALTER TABLE servico ALTER COLUMN numero_os SET NOT NULL;

-- Adicionar constraint UNIQUE por cliente e número de OS
ALTER TABLE servico ADD CONSTRAINT uk_servico_cliente_numero_os UNIQUE (cliente_id, numero_os);

-- Criar índice para busca rápida por número da OS
CREATE INDEX idx_servico_cliente_numero_os ON servico(cliente_id, numero_os);
