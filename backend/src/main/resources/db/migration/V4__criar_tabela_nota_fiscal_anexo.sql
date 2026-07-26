CREATE TABLE nota_fiscal_anexo (
    id              BIGSERIAL    PRIMARY KEY,
    nota_fiscal_id  BIGINT       NOT NULL UNIQUE REFERENCES nota_fiscal(id) ON DELETE CASCADE,
    nome_arquivo    VARCHAR(300) NOT NULL,
    tipo_conteudo   VARCHAR(100) NOT NULL,
    dados           BYTEA        NOT NULL,
    criado_em       TIMESTAMP    NOT NULL DEFAULT NOW()
);
