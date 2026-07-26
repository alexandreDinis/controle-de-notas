package com.oroboros.notafiscal.application;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.oroboros.notafiscal.infrastructure.persistence.entity.ClienteEntity;
import com.oroboros.notafiscal.infrastructure.persistence.entity.EmpresaLogoEntity;
import com.oroboros.notafiscal.infrastructure.persistence.repository.ClienteRepository;
import com.oroboros.notafiscal.web.dto.EmpresaResponse;
import com.oroboros.notafiscal.web.dto.RelatorioNotasResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class PdfReportService {

    private final TemplateEngine templateEngine;
    private final RelatorioService relatorioService;
    private final EmpresaService empresaService;
    private final ClienteRepository clienteRepository;

    public byte[] gerarRelatorioCobrancaPdf(Long clienteId, LocalDate inicio, LocalDate fim) {
        ClienteEntity cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado com ID: " + clienteId));

        RelatorioNotasResponse relatorioNotas = relatorioService.notasPorClientePeriodo(clienteId, inicio, fim);
        EmpresaResponse empresa = empresaService.obter();

        String logoBase64 = null;
        if (empresa.possuiLogo()) {
            try {
                EmpresaLogoEntity logoEntity = empresaService.obterLogo();
                logoBase64 = "data:" + logoEntity.getTipoConteudo() + ";base64," +
                        Base64.getEncoder().encodeToString(logoEntity.getDados());
            } catch (Exception ignored) {
                // Se falhar o carregamento do logo, segue sem logo
            }
        }

        Context context = new Context();
        context.setVariable("cliente", cliente);
        context.setVariable("empresa", empresa);
        context.setVariable("empresaLogoBase64", logoBase64);
        context.setVariable("inicio", inicio);
        context.setVariable("fim", fim);
        context.setVariable("notas", relatorioNotas.notas());
        context.setVariable("totalNotas", relatorioNotas.totalNotas());

        String htmlContent = templateEngine.process("relatorio-cobranca", context);

        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(htmlContent, null);
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao gerar PDF do relatório de cobrança: " + e.getMessage(), e);
        }
    }
}
