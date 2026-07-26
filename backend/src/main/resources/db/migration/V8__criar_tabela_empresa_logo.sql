-- Migration V8: Criar tabela empresa_logo (1:1 com empresa)
CREATE TABLE empresa_logo (
    id BIGSERIAL PRIMARY KEY,
    empresa_id BIGINT NOT NULL UNIQUE REFERENCES empresa(id) ON DELETE CASCADE,
    nome_arquivo VARCHAR(300) NOT NULL,
    tipo_conteudo VARCHAR(100) NOT NULL,
    dados BYTEA NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
