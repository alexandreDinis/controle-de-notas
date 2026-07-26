package com.oroboros.notafiscal.web;

import com.oroboros.notafiscal.application.PdfReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class RelatorioCobrancaController {

    private final PdfReportService pdfReportService;

    @GetMapping("/{clienteId}/relatorio-cobranca/pdf")
    public ResponseEntity<byte[]> gerarRelatorioCobrancaPdf(
            @PathVariable Long clienteId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim
    ) {
        byte[] pdfBytes = pdfReportService.gerarRelatorioCobrancaPdf(clienteId, inicio, fim);

        String filename = String.format("cobranca-cliente-%d-%s-a-%s.pdf", clienteId, inicio, fim);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
