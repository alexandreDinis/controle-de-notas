package com.oroboros.notafiscal.application;

import com.oroboros.notafiscal.infrastructure.persistence.entity.EmpresaEntity;
import com.oroboros.notafiscal.infrastructure.persistence.entity.EmpresaLogoEntity;
import com.oroboros.notafiscal.infrastructure.persistence.repository.EmpresaLogoRepository;
import com.oroboros.notafiscal.infrastructure.persistence.repository.EmpresaRepository;
import com.oroboros.notafiscal.web.dto.EmpresaRequest;
import com.oroboros.notafiscal.web.dto.EmpresaResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmpresaService {

    public static final Long EMPRESA_SINGLETON_ID = 1L;
    private static final long MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "image/svg+xml"
    );

    private final EmpresaRepository empresaRepository;
    private final EmpresaLogoRepository empresaLogoRepository;

    @Transactional(readOnly = true)
    public EmpresaResponse obter() {
        return empresaRepository.findById(EMPRESA_SINGLETON_ID)
                .map(this::toResponse)
                .orElseGet(() -> new EmpresaResponse(
                        EMPRESA_SINGLETON_ID,
                        null,
                        null,
                        null,
                        null,
                        null,
                        null,
                        false,
                        null,
                        null
                ));
    }

    @Transactional
    public EmpresaResponse salvarOuAtualizar(EmpresaRequest request) {
        EmpresaEntity entity = empresaRepository.findById(EMPRESA_SINGLETON_ID)
                .orElseGet(() -> EmpresaEntity.builder()
                        .id(EMPRESA_SINGLETON_ID)
                        .build());

        entity.setNome(request.nome());
        entity.setDocumento(request.documento());
        entity.setChavePix(request.chavePix());
        entity.setBanco(request.banco());
        entity.setAgencia(request.agencia());
        entity.setConta(request.conta());

        EmpresaEntity saved = empresaRepository.save(entity);
        return toResponse(saved);
    }

    @Transactional
    public void salvarLogo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Nenhum arquivo enviado para o logo.");
        }

        if (file.getSize() > MAX_LOGO_SIZE_BYTES) {
            throw new IllegalArgumentException("O logo da empresa deve ter no máximo 2MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Formato de imagem inválido. Use PNG, JPEG, WEBP ou SVG.");
        }

        EmpresaEntity empresa = empresaRepository.findById(EMPRESA_SINGLETON_ID)
                .orElseGet(() -> empresaRepository.save(
                        EmpresaEntity.builder().id(EMPRESA_SINGLETON_ID).build()
                ));

        empresaLogoRepository.findByEmpresaId(EMPRESA_SINGLETON_ID)
                .ifPresent(empresaLogoRepository::delete);

        try {
            EmpresaLogoEntity logoEntity = EmpresaLogoEntity.builder()
                    .empresa(empresa)
                    .nomeArquivo(file.getOriginalFilename() != null ? file.getOriginalFilename() : "logo")
                    .tipoConteudo(contentType)
                    .dados(file.getBytes())
                    .build();

            empresaLogoRepository.save(logoEntity);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao processar o upload do logo.", e);
        }
    }

    @Transactional(readOnly = true)
    public EmpresaLogoEntity obterLogo() {
        return empresaLogoRepository.findByEmpresaId(EMPRESA_SINGLETON_ID)
                .orElseThrow(() -> new IllegalArgumentException("Empresa não possui logo cadastrado."));
    }

    private EmpresaResponse toResponse(EmpresaEntity entity) {
        boolean possuiLogo = empresaLogoRepository.findByEmpresaId(entity.getId()).isPresent();
        return new EmpresaResponse(
                entity.getId(),
                entity.getNome(),
                entity.getDocumento(),
                entity.getChavePix(),
                entity.getBanco(),
                entity.getAgencia(),
                entity.getConta(),
                possuiLogo,
                entity.getCriadoEm(),
                entity.getAtualizadoEm()
        );
    }
}
