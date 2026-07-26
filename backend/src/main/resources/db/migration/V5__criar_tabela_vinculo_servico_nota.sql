CREATE TABLE vinculo_servico_nota (
    id              BIGSERIAL      PRIMARY KEY,
    servico_id      BIGINT         NOT NULL REFERENCES servico(id) ON DELETE CASCADE,
    nota_fiscal_id  BIGINT         NOT NULL REFERENCES nota_fiscal(id) ON DELETE CASCADE,
    cliente_id      BIGINT         NOT NULL REFERENCES cliente(id),
    valor_vinculado NUMERIC(15,2)  NOT NULL CHECK (valor_vinculado > 0)
);

CREATE INDEX idx_vinculo_cliente ON vinculo_servico_nota(cliente_id);
CREATE INDEX idx_vinculo_servico ON vinculo_servico_nota(servico_id);
CREATE INDEX idx_vinculo_nota    ON vinculo_servico_nota(nota_fiscal_id);
