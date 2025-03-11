const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
          <p className="text-gray-700">
            Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Definições</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Dados Pessoais: informação relacionada a pessoa natural identificada ou identificável.</li>
            <li>Tratamento: toda operação realizada com dados pessoais.</li>
            <li>Titular: pessoa natural a quem se referem os dados pessoais.</li>
            <li>Controlador: pessoa responsável pelas decisões sobre o tratamento de dados pessoais.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Coleta de Dados</h2>
          <h3 className="text-xl font-medium mb-2">3.1. Dados que coletamos:</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Dados de identificação (nome, CPF, RG)</li>
            <li>Dados de contato (email, telefone, endereço)</li>
            <li>Dados de acesso e navegação</li>
            <li>Dados de preferências e interesses</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Finalidades do Tratamento</h2>
          <p className="text-gray-700 mb-4">
            Seus dados pessoais são tratados para as seguintes finalidades:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Prestação dos serviços contratados</li>
            <li>Comunicação sobre produtos e serviços</li>
            <li>Melhorias na experiência do usuário</li>
            <li>Cumprimento de obrigações legais e regulatórias</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Base Legal</h2>
          <p className="text-gray-700 mb-4">
            O tratamento de dados pessoais é realizado com base nas seguintes hipóteses legais:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Consentimento do titular</li>
            <li>Cumprimento de obrigação legal ou regulatória</li>
            <li>Execução de contrato</li>
            <li>Legítimo interesse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Direitos dos Titulares</h2>
          <p className="text-gray-700 mb-4">
            Em conformidade com a LGPD, você tem os seguintes direitos:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Confirmação da existência de tratamento</li>
            <li>Acesso aos dados</li>
            <li>Correção de dados incompletos ou desatualizados</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
            <li>Portabilidade dos dados</li>
            <li>Eliminação dos dados (quando aplicável)</li>
            <li>Revogação do consentimento</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Segurança dos Dados</h2>
          <p className="text-gray-700 mb-4">
            Implementamos medidas técnicas e organizacionais apropriadas para proteger seus dados pessoais, incluindo:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Criptografia de dados</li>
            <li>Controles de acesso</li>
            <li>Backup regular</li>
            <li>Políticas e procedimentos de segurança</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Compartilhamento de Dados</h2>
          <p className="text-gray-700 mb-4">
            Seus dados podem ser compartilhados com:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Prestadores de serviços essenciais</li>
            <li>Autoridades governamentais, quando exigido por lei</li>
            <li>Parceiros comerciais (mediante seu consentimento)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Retenção de Dados</h2>
          <p className="text-gray-700">
            Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades para as quais foram coletados, ou para cumprir com obrigações legais e regulatórias.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Contato</h2>
          <p className="text-gray-700">
            Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de seus dados pessoais, entre em contato com nosso Encarregado de Proteção de Dados através do email: [naoresponda@clubedosfoguetes.com.br]
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Atualizações da Política</h2>
          <p className="text-gray-700">
            Esta política pode ser atualizada periodicamente. A versão mais recente estará sempre disponível em nosso site.
          </p>
          <p className="text-gray-700 mt-4">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;