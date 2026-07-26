CREATE TABLE servico (
    id            BIGSERIAL      PRIMARY KEY,
    cliente_id    BIGINT         NOT NULL REFERENCES cliente(id),
    data          DATE           NOT NULL,
    descricao     TEXT           NOT NULL,
    valor         NUMERIC(15,2)  NOT NULL CHECK (valor > 0),
    criado_em     TIMESTAMP      NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_servico_cliente_data ON servico(cliente_id, data);
