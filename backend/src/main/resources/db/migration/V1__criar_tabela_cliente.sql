CREATE TABLE cliente (
    id            BIGSERIAL    PRIMARY KEY,
    nome          VARCHAR(200) NOT NULL,
    telefone      VARCHAR(20),
    email         VARCHAR(200),
    documento     VARCHAR(20),
    criado_em     TIMESTAMP    NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP    NOT NULL DEFAULT NOW()
);
