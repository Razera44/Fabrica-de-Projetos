// Cada pergunta tem 3 opções, da mais segura (índice 0) pra mais arriscada (índice 2)
export const questions = [
  { theme: 'Backup', text: 'Sua empresa faz backup dos arquivos importantes?', options: ['Sim, automático e regular', 'Sim, mas manual e irregular', 'Não faço backup'] },
  { theme: 'Backup', text: 'Onde fica armazenada a cópia de backup?', options: ['Em nuvem ou local externo, fora do computador principal', 'No mesmo computador ou HD interno', 'Não sei / não tenho backup'] },
  { theme: 'Backup', text: 'Com que frequência o backup é atualizado?', options: ['Diariamente', 'Semanalmente ou mensalmente', 'Raramente ou nunca'] },
  { theme: 'Backup', text: 'Você já testou restaurar um backup para ver se ele funciona?', options: ['Sim, já testei', 'Não, nunca testei', 'Não tenho backup pra testar'] },
  { theme: 'Backup', text: 'Se o computador principal quebrasse hoje, quanto tempo levaria pra empresa voltar a funcionar?', options: ['Menos de 1 dia', 'Alguns dias', 'Não sei / levaria semanas'] },

  { theme: 'Senhas', text: 'As senhas dos sistemas da empresa são únicas entre si?', options: ['Sim, cada sistema tem uma senha diferente', 'Algumas são repetidas', 'Uso a mesma senha em quase tudo'] },
  { theme: 'Senhas', text: 'Os funcionários usam autenticação em duas etapas (2FA) nos acessos importantes?', options: ['Sim, na maioria dos acessos', 'Em alguns', 'Não uso'] },
  { theme: 'Senhas', text: 'Como as senhas são compartilhadas entre a equipe, quando necessário?', options: ['Por um gerenciador de senhas seguro', 'Por WhatsApp, papel ou planilha', 'Não compartilhamos'] },
  { theme: 'Senhas', text: 'Ex-funcionários ainda têm acesso a algum sistema da empresa?', options: ['Não, os acessos são removidos ao sair', 'Não sei dizer', 'Sim, provavelmente'] },
  { theme: 'Senhas', text: 'Com que frequência as senhas são trocadas ou revisadas?', options: ['Periodicamente, seguindo uma rotina', 'Só quando esqueço ou dá problema', 'Nunca trocamos'] },

  { theme: 'Antivírus', text: 'Os computadores da empresa têm antivírus instalado?', options: ['Sim, em todos e atualizado', 'Em alguns', 'Não tenho antivírus'] },
  { theme: 'Antivírus', text: 'As atualizações do sistema operacional são feitas automaticamente?', options: ['Sim, automáticas', 'Às vezes, manualmente', 'Não atualizo'] },
  { theme: 'Antivírus', text: 'Os dispositivos da empresa (celulares, notebooks) têm senha ou biometria de bloqueio?', options: ['Sim, todos', 'Alguns', 'Nenhum'] },
  { theme: 'Antivírus', text: 'A empresa usa uma rede Wi-Fi separada para visitantes e para o negócio?', options: ['Sim, redes separadas', 'Não, é a mesma rede pra tudo', 'Não sei'] },
  { theme: 'Antivírus', text: 'Já aconteceu algum caso de vírus, travamento suspeito ou sequestro de arquivos (ransomware)?', options: ['Nunca', 'Já aconteceu, mas resolvemos', 'Já aconteceu e perdemos dados'] },

  { theme: 'LGPD', text: 'A empresa sabe quais dados pessoais de clientes ela armazena?', options: ['Sim, temos isso mapeado', 'Mais ou menos, não é formalizado', 'Não sei dizer'] },
  { theme: 'LGPD', text: 'Existe uma política de privacidade visível para os clientes?', options: ['Sim, publicada e atualizada', 'Existe, mas está desatualizada', 'Não existe'] },
  { theme: 'LGPD', text: 'Os dados dos clientes são compartilhados com terceiros (fornecedores, parceiros)?', options: ['Não compartilhamos', 'Compartilhamos com consentimento formal', 'Compartilhamos sem controle definido'] },
  { theme: 'LGPD', text: 'Se um cliente pedir para apagar seus dados, a empresa sabe como fazer isso?', options: ['Sim, temos um processo definido', 'Saberíamos resolver na hora', 'Não saberíamos o que fazer'] },
  { theme: 'LGPD', text: 'Algum funcionário já recebeu orientação sobre como tratar dados pessoais de clientes?', options: ['Sim, todos foram orientados', 'Só alguns', 'Ninguém recebeu orientação'] }
]
