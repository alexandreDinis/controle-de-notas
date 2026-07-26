CREATE TABLE nota_fiscal (
    id                  BIGSERIAL      PRIMARY KEY,
    cliente_id          BIGINT         NOT NULL REFERENCES cliente(id),
    numero_nota         VARCHAR(50)    NOT NULL,
    data_emissao        DATE           NOT NULL,
    prazo_pagamento     DATE           NOT NULL,
    valor               NUMERIC(15,2)  NOT NULL CHECK (valor > 0),
    status_pagamento    VARCHAR(20)    NOT NULL DEFAULT 'NAO_PAGA',
    criado_em           TIMESTAMP      NOT NULL DEFAULT NOW(),
    atualizado_em       TIMESTAMP      NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_status      CHECK (status_pagamento IN ('PAGA', 'NAO_PAGA')),
    CONSTRAINT uq_cliente_nota UNIQUE (cliente_id, numero_nota)
);

CREATE INDEX idx_nota_fiscal_cliente_data ON nota_fiscal(cliente_id, data_emissao);
