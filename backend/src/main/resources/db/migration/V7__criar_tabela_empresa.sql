-- Migration V7: Criar tabela empresa (singleton)
CREATE TABLE empresa (
    id BIGINT PRIMARY KEY,
    nome VARCHAR(150),
    documento VARCHAR(20),
    chave_pix VARCHAR(100),
    banco VARCHAR(50),
    agencia VARCHAR(20),
    conta VARCHAR(30),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
