# 📑 NotaControl — Sistema de Controle de Emissão de Notas Fiscais & Relatórios de Cobrança

![NotaControl Banner](docs/images/notacontrol_banner.png)

> **NotaControl** é um sistema completo de gestão de serviços, notas fiscais, motor de conciliação financeira automática e geração de relatórios de cobrança em PDF.

---

## 🎯 Sobre o Sistema

O **NotaControl** soluciona o desafio de acompanhar o equilíbrio entre **Serviços Prestados (Ordens de Serviço)** e **Notas Fiscais Emitidas** para clientes. O sistema conta com um **motor de conciliação FIFO automático**, extrato cronológico, relatórios de balanço e geração de boletins de cobrança em PDF totalmente formatados com o padrão monetário brasileiro.

---

## ✨ Funcionalidades Principais

### 👥 1. Gestão de Clientes
- Cadastro completo de clientes com validações de documento (CPF/CNPJ), telefone e e-mail.

### 🛠️ 2. Controle de Serviços (Ordens de Serviço - OS)
- Registro de serviços vinculados ao cliente com código único de OS (`numero_os`), data, descrição e valor monetário.

### 🧾 3. Gestão de Notas Fiscais
- Controle de emissão com número de nota (`numero_nota`), data de emissão, prazo de pagamento, valor e status (`PAGA`, `NAO_PAGA`, `VENCIDA`).
- **Upload e Download de Anexos**: Suporte a upload de comprovantes ou PDFs das notas fiscais emitidas.

### 🔄 4. Motor de Conciliação Financeira FIFO
- O sistema vincula automaticamente notas fiscais e serviços prestados por ordem cronológica (First-In, First-Out).
- Exibe o **Balanço de Conciliação**:
  - **Clientes com Notas a Emitir**: Serviços realizados sem cobertura total de nota fiscal (débito).
  - **Clientes com Serviços a Prestar**: Notas fiscais já emitidas que superam os serviços executados (crédito).

### 📑 5. Relatório de Cobrança em PDF
- Geração instantânea de relatório de cobrança em PDF por período configurável.
- Renderização via **OpenHTMLtoPDF** com template **Thymeleaf**.
- Formatação em Real Brasileiro (`R$ 1.234,56`) usando `#numbers.formatDecimal`.
- Exibição de marca d'água/logotipo da empresa em Base64 e instruções de pagamento (PIX e dados bancários) no rodapé.

### 🏢 6. Configuração da Empresa (Singleton ID = 1)
- Painel **"Minha Empresa"** para gerenciar Razão Social, CNPJ/CPF, Chave PIX, Banco, Agência e Conta Corrente.
- Upload de logotipo (formatos `image/*` até 2MB) armazenado separadamente no banco em formato binário (`BYTEA`).

---

## 🛠️ Stack Tecnológica

### Backend (`/backend`)
- **Linguagem**: Java 21
- **Framework**: Spring Boot 3.5 (Spring Data JPA, Spring Web, Validation)
- **Banco de Dados**: PostgreSQL 16
- **Migrations**: Flyway (Versões V1 a V8)
- **Geração de PDF**: OpenHTMLtoPDF (Licença permissiva Apache 2.0 / LGPL) + Thymeleaf
- **Testes**: Testcontainers + JUnit 5

### Frontend (`/frontend`)
- **Framework**: React 18 + TypeScript + Vite
- **Estilização**: Tailwind CSS (Componentes customizados do zero, sem bibliotecas prontas)
- **Gerenciamento de Estado & Cache**: TanStack Query (React Query v5)
- **Formulários & Validação**: React Hook Form + Zod
- **Roteamento**: React Router v6

### DevOps & Containers
- **Docker & Docker Compose**: Configurações isoladas para Desenvolvimento e Produção.
- **Nginx**: Proxy reverso no container frontend de produção.

---

## 🚀 Como Executar o Sistema

### 1. 🏭 Execução em Produção (Recomendado)

O sistema possui um script de produção pré-configurado que roda a aplicação inteira em containers isolados sem conflito de portas com outros serviços da sua máquina.

```bash
./nf-control
```

Após a inicialização dos containers:
- 🌐 **Aplicação Web (Frontend)**: `http://localhost:8090`
- ⚙️ **API Backend**: `http://localhost:8091`
- 🗄️ **Banco PostgreSQL Prod**: `localhost:5438`

> 💡 **Dica**: O script `nf-control` também foi adicionado a `~/.local/bin/nf-control`, permitindo que você digite `nf-control` de qualquer diretório no seu terminal Linux!

---

### 2. 💻 Execução em Desenvolvimento

Para rodar em modo de desenvolvimento (com hot-reload no frontend e suporte a debug no backend):

```bash
./nf-control-dev
```

Portas do ambiente de desenvolvimento:
- 🌐 **Frontend (Vite Dev Server)**: `http://localhost:5173`
- ⚙️ **Backend (Spring Boot Dev)**: `http://localhost:8080`
- 🗄️ **Banco PostgreSQL Dev**: `localhost:5432`

---

## 📁 Estrutura de Diretórios

```
controle-de-notas/
├── backend/                  # Aplicação Spring Boot (Java 21)
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/oroboros/notafiscal/   # Código fonte (Controller, Service, Domain)
│   │   │   └── resources/
│   │   │       ├── db/migration/               # Flyway Migrations (V1..V8)
│   │   │       ├── templates/                  # Template Thymeleaf (relatorio-cobranca.html)
│   │   │       └── application.yml
│   └── Dockerfile            # Multi-stage build Java 21
│
├── frontend/                 # Aplicação SPA React (TypeScript + Vite + Tailwind)
│   ├── src/
│   │   ├── api/              # Chamadas Axios à API REST
│   │   ├── components/       # UI Components (Modais, Cards, Botões, Badges)
│   │   ├── features/         # Telas (Clientes, Serviços, Notas, Extrato, Relatórios, Empresa)
│   │   ├── hooks/            # TanStack React Query Hooks
│   │   └── types/            # DTOs e Interfaces TypeScript
│   ├── nginx.conf            # Configuração do Nginx para Produção
│   └── Dockerfile            # Multi-stage build Node 20 + Nginx
│
├── docs/images/              # Imagens e Banners de Documentação
├── docker-compose.prod.yml   # Stack Docker de Produção (Portas 8090, 8091, 5438)
├── docker-compose.dev.yml    # Stack Docker de Desenvolvimento (PostgreSQL 5432)
├── nf-control                # Script executável de inicialização em Produção
├── nf-control-dev            # Script executável de inicialização em Desenvolvimento
├── .env.example              # Modelo de variáveis de ambiente
└── .gitignore                # Arquivo gitignore global
```

---

## 🔒 Segurança e Dados Sensíveis

Todas as credenciais e configurações de banco de dados foram externalizadas para variáveis de ambiente com valores padrão seguros para desenvolvimento local (`.env.example`). O repositório ignora arquivos `.env`, binários compilados (`target/`, `dist/`, `node_modules/`) e logs de execução.

---

## 📝 Licença e Uso

Desenvolvido para uso interno de controle financeiro e conciliação de emissão de notas fiscais.
