// Uma ação sugerida por tema, de acordo com a faixa de risco do tema (crit / warn / safe)
export const actionLibrary = {
  Backup: {
    crit: { title: 'Configurar backup automático diário', desc: 'Ativar cópia de segurança em nuvem ou HD externo, fora do computador principal, para os arquivos da empresa.' },
    warn: { title: 'Tornar o backup automático e testado', desc: 'Automatizar a rotina existente e testar a restauração pelo menos uma vez por trimestre.' },
    safe: { title: 'Manter a rotina de backup ativa', desc: 'Continuar testando a restauração periodicamente para garantir que tudo funciona quando precisar.' }
  },
  Senhas: {
    crit: { title: 'Eliminar senhas repetidas entre sistemas', desc: 'Adotar um gerenciador de senhas e exigir senha única por serviço para reduzir risco de invasão em cadeia.' },
    warn: { title: 'Ativar 2FA nos acessos mais importantes', desc: 'Priorizar e-mail, sistemas financeiros e redes sociais da empresa com autenticação em duas etapas.' },
    safe: { title: 'Manter a revisão periódica de acessos', desc: 'Continuar removendo acessos de ex-funcionários e revisando senhas com regularidade.' }
  },
  Antivírus: {
    crit: { title: 'Instalar antivírus em todos os dispositivos', desc: 'Priorizar os computadores que lidam com dados de clientes ou pagamentos.' },
    warn: { title: 'Padronizar as atualizações automáticas', desc: 'Ativar atualização automática de sistema operacional e antivírus em todos os aparelhos da empresa.' },
    safe: { title: 'Manter a atualização automática ativada', desc: 'Já é o ponto mais forte da empresa — só falta garantir que continue assim em todos os aparelhos novos.' }
  },
  LGPD: {
    crit: { title: 'Mapear os dados de clientes armazenados', desc: 'Listar quais dados pessoais a empresa guarda e onde, primeiro passo para uma política de privacidade simples.' },
    warn: { title: 'Publicar uma política de privacidade simples', desc: 'Deixar claro pro cliente quais dados são coletados e para que servem, mesmo que em um texto curto.' },
    safe: { title: 'Revisar a política de privacidade anualmente', desc: 'Manter o texto atualizado conforme a empresa passa a coletar ou compartilhar novos tipos de dado.' }
  }
}
