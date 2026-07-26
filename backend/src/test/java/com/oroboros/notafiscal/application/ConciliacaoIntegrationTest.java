package com.oroboros.notafiscal.application;

import com.oroboros.notafiscal.infrastructure.persistence.entity.*;
import com.oroboros.notafiscal.infrastructure.persistence.repository.*;
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
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Teste de integração da conciliação com PostgreSQL real via Testcontainers.
 * Fluxo completo: cadastrar serviço → cadastrar nota → verificar vínculo persistido.
 */
@SpringBootTest
@Testcontainers
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class ConciliacaoIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ServicoService servicoService;

    @Autowired
    private NotaFiscalService notaFiscalService;

    @Autowired
    private VinculoServicoNotaRepository vinculoRepository;

    @Autowired
    private ServicoRepository servicoRepository;

    @Autowired
    private NotaFiscalRepository notaFiscalRepository;

    @Test
    @DisplayName("Fluxo completo: serviço + nota → vínculo persistido corretamente")
    void fluxoCompleto_servicoENota_vinculoPersistido() {
        // 1. Criar cliente
        ClienteEntity cliente = clienteRepository.save(
                ClienteEntity.builder()
                        .nome("Cliente Teste")
                        .documento("12345678900")
                        .build());

        Long clienteId = cliente.getId();

        // 2. Cadastrar serviço (dispara reconciliação)
        var servicoResp = servicoService.criar(clienteId,
                new com.oroboros.notafiscal.web.dto.ServicoRequest(
                        "OS-001",
                        LocalDate.of(2025, 1, 10),
                        "Serviço de consultoria",
                        new BigDecimal("500.00")));

        // 3. Neste ponto, sem notas, não deve haver vínculos
        List<VinculoServicoNotaEntity> vinculosSemNota = vinculoRepository.findByClienteId(clienteId);
        assertTrue(vinculosSemNota.isEmpty(), "Sem notas, não deve haver vínculos");

        // 4. Cadastrar nota fiscal (dispara reconciliação)
        var notaResp = notaFiscalService.criar(clienteId,
                new com.oroboros.notafiscal.web.dto.NotaFiscalRequest(
                        "NF-001",
                        LocalDate.of(2025, 1, 15),
                        LocalDate.of(2025, 2, 15),
                        new BigDecimal("300.00")));

        // 5. Verificar que o vínculo foi persistido
        List<VinculoServicoNotaEntity> vinculos = vinculoRepository.findByClienteId(clienteId);
        assertEquals(1, vinculos.size());

        VinculoServicoNotaEntity vinculo = vinculos.get(0);
        assertEquals(servicoResp.id(), vinculo.getServico().getId());
        assertEquals(notaResp.id(), vinculo.getNotaFiscal().getId());
        assertEquals(0, new BigDecimal("300.00").compareTo(vinculo.getValorVinculado()));

        // 6. Cadastrar segunda nota → deve recalcular
        notaFiscalService.criar(clienteId,
                new com.oroboros.notafiscal.web.dto.NotaFiscalRequest(
                        "NF-002",
                        LocalDate.of(2025, 1, 20),
                        LocalDate.of(2025, 2, 20),
                        new BigDecimal("200.00")));

        List<VinculoServicoNotaEntity> vinculosAtualizados = vinculoRepository.findByClienteId(clienteId);
        assertEquals(2, vinculosAtualizados.size());

        // Soma dos vínculos deve ser 500 (valor total do serviço)
        BigDecimal somaVinculos = vinculosAtualizados.stream()
                .map(VinculoServicoNotaEntity::getValorVinculado)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(0, new BigDecimal("500.00").compareTo(somaVinculos));
    }

    @Test
    @DisplayName("Excluir nota → recalcula vínculos")
    void excluirNota_recalculaVinculos() {
        // Setup
        ClienteEntity cliente = clienteRepository.save(
                ClienteEntity.builder().nome("Cliente 2").build());
        Long clienteId = cliente.getId();

        servicoService.criar(clienteId,
                new com.oroboros.notafiscal.web.dto.ServicoRequest(
                        "OS-100", LocalDate.of(2025, 3, 1), "Serviço A", new BigDecimal("400.00")));

        var nota = notaFiscalService.criar(clienteId,
                new com.oroboros.notafiscal.web.dto.NotaFiscalRequest(
                        "NF-100", LocalDate.of(2025, 3, 5),
                        LocalDate.of(2025, 4, 5), new BigDecimal("400.00")));

        assertEquals(1, vinculoRepository.findByClienteId(clienteId).size());

        // Excluir nota → reconciliação deve remover vínculos
        notaFiscalService.excluir(nota.id());

        assertTrue(vinculoRepository.findByClienteId(clienteId).isEmpty(),
                "Após excluir a nota, vínculos devem ser removidos");
    }
}
