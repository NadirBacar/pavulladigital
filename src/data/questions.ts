import { QuizQuestion } from '@/types';

// Quiz Gestão Documental (com respostas variadas e equilibradas)
export const questionBank: QuizQuestion[] = [
  // 1. O Documento Digital como Prova
  { 
    question: "Qual dos atributos essenciais do documento digital garante que ele é uma representação completa e precisa das transações ou factos de que testemunha?", 
    options: ["Usabilidade", "Autenticidade", "Integridade", "Fiabilidade"], 
    correct: 3 
  },
  { 
    question: "O que é exigido para garantir a Integridade de um documento digital, conforme a ISO 15489?", 
    options: [
      "Apenas a atribuição de um título e autor", 
      "Mecanismos de segurança como hash ou assinatura digital para detetar alterações",
      "Apenas o controlo de acesso", 
      "A sua transferência imediata para um Repositório Digital Confiável (RDC)"
    ], 
    correct: 1 
  },

  // 2. Normas Internacionais e Aplicação
  { 
    question: "Qual norma internacional estabelece os princípios e requisitos para o programa de gestão de documentos de uma organização?", 
    options: ["MoReq", "OAIS (ISO 14721)", "NDSA Levels", "ISO 15489"], 
    correct: 3 
  },
  { 
    question: "O MoReq (Model Requirements for the Management of Electronic Records) é mais utilizado para qual finalidade?", 
    options: [
      "Orientar a conceção, avaliação e aquisição de Sistemas Informatizados de Gestão para Documentos de Arquivo (SIGAD)",
      "Certificação de Repositórios Digitais Confiáveis", 
      "Definição do Ciclo de Vida do Documento", 
      "Definir os padrões de metadados de preservação"
    ], 
    correct: 0 
  },
  { 
    question: "O modelo OAIS (ISO 14721) define três tipos de Pacotes de Informação. Qual pacote é mantido no arquivo, contendo o objeto digital e os metadados de preservação?", 
    options: [
      "SIP (Submission Information Package)", 
      "AIP (Archival Information Package)", 
      "DIP (Dissemination Information Package)", 
      "PIP (Preservation Information Package)"
    ], 
    correct: 1 
  },

  // 3. Ciclo de Vida e Instrumentos
  { 
    question: "No Ciclo de Vida do Documento Digital, a atribuição imediata de um identificador único, metadados e classificação ocorre em qual fase?", 
    options: ["Uso e Manutenção", "Avaliação", "Criação e Captura", "Destinação Final"], 
    correct: 2 
  },
  { 
    question: "Qual instrumento de gestão arquivística é automatizado no SIGAD para calcular e exibir o prazo de guarda e a data de destinação final do documento?", 
    options: [
      "Plano de Classificação (PC)", 
      "Registo de Auditoria (Audit Trail)", 
      "Política de Metadados",
      "Tabela de Avaliação (TA) ou TTD"
    ], 
    correct: 3 
  },

  // 4. Modelos de Maturidade e Preservação
  { 
    question: "Qual modelo de maturidade foca-se numa visão holística da gestão e preservação de dados digitais ao longo de todo o seu ciclo de vida, enfatizando a curadoria contínua?", 
    options: [
      "DCC (Digital Curation Centre) Lifecycle Model",
      "NDSA Levels of Digital Preservation", 
      "ISO 16363", 
      "MoReq"
    ], 
    correct: 0 
  },
  { 
    question: "Os NDSA Levels of Digital Preservation ajudam as instituições a avaliar suas capacidades em cinco áreas funcionais. Qual das seguintes áreas é uma das cinco áreas funcionais do NDSA?", 
    options: [
      "Autenticidade e Fiabilidade", 
      "Armazenamento e Localização Geográfica", 
      "Gestão do Plano de Classificação", 
      "Workflow de Destinação"
    ], 
    correct: 1 
  },
  { 
    question: "A ISO 16363 formaliza os critérios para a auditoria e certificação de que tipo de entidade?", 
    options: [
      "Sistemas Informatizados de Gestão para Documentos de Arquivo (SIGAD)", 
      "Serviços de Digitalização", 
      "Repositórios Digitais Confiáveis (RDC)", 
      "Programas de Gestão de Documentos"
    ], 
    correct: 2 
  },

  // 5. Padrões de Metadados
  { 
    question: "Qual padrão de metadados é considerado o mais importante para a preservação digital, focando-se na proveniência, integridade, direitos e eventos de preservação?", 
    options: ["Dublin Core (DC)", "METS", "EAD", "PREMIS"], 
    correct: 3 
  },
  { 
    question: "Qual padrão de metadados é utilizado para agregar e organizar os diferentes tipos de metadados (descritivos, administrativos e de preservação) num único pacote para transferência (SIP/AIP)?", 
    options: [
      "METS (Metadata Encoding and Transmission Standard)",
      "Dublin Core", 
      "PREMIS", 
      "MODS"
    ], 
    correct: 0 
  },
  { 
    question: "No processo de digitalização, a captura de metadados como a resolução (dpi) e o formato de ficheiro (TIFF) é essencial. Estes são classificados como que tipo de metadados?", 
    options: ["Descritivos", "Técnicos/Administrativos", "Contextuais", "Estruturais"], 
    correct: 1 
  },
  { 
    question: "A falha em manter um Registo de Auditoria (Audit Trail) inalterável no SIGAD compromete diretamente qual atributo essencial do documento digital?", 
    options: ["Usabilidade", "Fiabilidade", "Integridade", "Acessibilidade"], 
    correct: 2 
  },
  { 
    question: "Qual dos seguintes cenários reflete uma falha na aplicação do princípio da Classificação e Avaliação Precoce no ambiente digital?", 
    options: [
      "O SIGAD não permite a pesquisa por metadados", 
      "O documento digital não possui assinatura digital", 
      "O documento é armazenado em formato proprietário",
      "O documento é capturado no SIGAD sem a atribuição obrigatória de um código do Plano de Classificação"
    ], 
    correct: 3 
  },
];