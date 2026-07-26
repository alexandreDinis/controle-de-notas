package com.oroboros.notafiscal.application;

import com.oroboros.notafiscal.infrastructure.persistence.entity.ClienteEntity;
import com.oroboros.notafiscal.infrastructure.persistence.repository.ClienteRepository;
import com.oroboros.notafiscal.infrastructure.persistence.repository.EmpresaRepository;
import com.oroboros.notafiscal.web.dto.EmpresaRequest;
import com.oroboros.notafiscal.web.dto.NotaFiscalRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class PdfReportServiceTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private PdfReportService pdfReportService;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private NotaFiscalService notaFiscalService;

    @Autowired
    private EmpresaService empresaService;

    @Test
    @DisplayName("Geração do PDF de cobrança deve retornar bytes válidos (> 0 bytes)")
    void gerarRelatorioCobrancaPdf_comDadosFicticios_deveRetornarPdfValido() {
        // 1. Cadastrar empresa fictícia
        empresaService.salvarOuAtualizar(new EmpresaRequest(
                "Empresa Teste LTDA",
                "12.345.678/0001-99",
                "financeiro@empresateste.com",
                "Banco do Brasil",
                "1234",
                "56789-0"
        ));

        // 2. Cadastrar cliente fictício
        ClienteEntity cliente = clienteRepository.save(
                ClienteEntity.builder()
                        .nome("Cliente Soluções LTDA")
                        .documento("98.765.432/0001-11")
                        .build());

        // 3. Cadastrar nota fiscal fictícia
        notaFiscalService.criar(cliente.getId(), new NotaFiscalRequest(
                "NF-999",
                LocalDate.of(2025, 5, 1),
                LocalDate.of(2025, 5, 15),
                new BigDecimal("1500.50")
        ));

        // 4. Gerar o PDF de cobrança
        byte[] pdfBytes = pdfReportService.gerarRelatorioCobrancaPdf(
                cliente.getId(),
                LocalDate.of(2025, 1, 1),
                LocalDate.of(2025, 12, 31)
        );

        // 5. Asserções
        assertNotNull(pdfBytes, "O PDF gerado não deve ser nulo");
        assertTrue(pdfBytes.length > 0, "O tamanho do arquivo PDF deve ser maior que zero");
    }
}
