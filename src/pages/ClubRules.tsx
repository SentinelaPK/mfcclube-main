import { ScrollText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ClubRules = () => {
  const sections = [
    {
      id: "sobre",
      title: "Sobre o Aplicativo (Funcionamento)",
      content: [
        "Este aplicativo é utilizado exclusivamente para organizar o Mentira Futebol Clube (MFC).",
        "Administradores podem criar, editar e excluir jogadores, partidas, penalidades e lançamentos do caixa.",
        "Jogadores comuns possuem acesso apenas para visualização.",
        "Todas as informações ficam registradas para garantir transparência.",
        "O uso indevido do sistema pode gerar bloqueio de acesso."
      ]
    },
    {
      id: "regras-gerais",
      title: "Regras Gerais do Grupo (MFC)",
      content: [
        "O MFC funciona com base em compromisso, respeito e organização.",
        "Ofensas, agressões ou atitudes antidesportivas não são toleradas.",
        "Casos não previstos neste regulamento serão analisados pelo presidente e vice-presidente.",
        "As decisões da administração são finais."
      ]
    },
    {
      id: "horarios",
      title: "Horários dos Jogos e Pontualidade",
      content: [
        "Os jogos acontecem todas as quintas-feiras.",
        "O início do jogo é pontualmente às 18h15.",
        "Todos os jogadores devem chegar até 18h05.",
        "Atrasos frequentes podem gerar advertências e suspensões."
      ]
    },
    {
      id: "confirmacao",
      title: "Confirmação de Presença e Desistências",
      content: [
        "Mensalistas devem confirmar presença até quarta-feira às 12h.",
        "Quem não confirmar perde prioridade na escalação.",
        "Convidados entram na lista de espera.",
        "Desistências sem prejuízo são aceitas até quinta-feira às 10h00.",
        "Após esse horário, o jogador deve providenciar substituto.",
        "Desistências frequentes geram penalidades."
      ]
    },
    {
      id: "times",
      title: "Composição dos Times e Substituições",
      content: [
        "Os jogos contam com 14 jogadores, divididos em dois times de 7.",
        "Cada time possui 1 goleiro, 4 jogadores de linha e 2 reservas.",
        "As substituições ocorrem a cada 10 minutos, nos horários: 18h25, 18h35, 18h45, 18h55 e 19h05.",
        "As trocas devem ser rápidas e organizadas."
      ]
    },
    {
      id: "whatsapp",
      title: "Grupo Oficial do WhatsApp",
      content: [
        "Todos os membros devem participar das confirmações semanais.",
        "Jogadores escalados pagam R$15,00 por jogo, sendo mensalistas ou não.",
        "Convidados fora do grupo do WhatsApp, chamados apenas para completar time, estão isentos.",
        "Apenas membros ativos permanecem no grupo."
      ]
    },
    {
      id: "financeiro",
      title: "Financeiro e Modalidades",
      content: [
        "**Mensalidade:**",
        "• Jogadores: R$50,00 por mês.",
        "• Goleiros e presidente: R$25,00 por mês.",
        "• Convidados da lista de espera: R$15,00 por jogo.",
        "",
        "**Modalidades:**",
        "",
        "**Sócio Torcedor:**",
        "• Contribuição mensal de R$25,00.",
        "• Direito a 1 jogo gratuito por mês.",
        "• Participa da festa de encerramento sem custo extra.",
        "",
        "**Jogador Reserva:**",
        "• Paga R$15,00 por jogo.",
        "• Não possui jogo gratuito mensal.",
        "• Festa de encerramento paga à parte.",
        "",
        "Somente jogadores enquadrados em uma dessas modalidades permanecem ativos."
      ],
      isFormatted: true
    },
    {
      id: "penalidades",
      title: "Penalidades e Conduta",
      content: [
        "Atrasos frequentes geram advertências e suspensões.",
        "Faltas injustificadas geram multa, perda de pontos no ranking e suspensão.",
        "O uso incorreto do uniforme gera advertência e suspensão em caso de reincidência.",
        "Agressões ou condutas graves serão avaliadas pela administração."
      ]
    },
    {
      id: "ranking",
      title: "Ranking",
      content: [
        "Vitória por 5 ou mais gols: +3 pontos.",
        "Vitória: +2 pontos.",
        "Empate: +1 ponto.",
        "Participação no jogo: +1 ponto.",
        "Falta injustificada: -3 pontos.",
        "Uniforme incompleto: -1 ponto.",
        "Apenas mensalistas ativos aparecem no ranking."
      ]
    },
    {
      id: "administracao",
      title: "Administração e Uso do Sistema",
      content: [
        "Administradores possuem acesso total ao sistema.",
        "Jogadores comuns possuem acesso apenas para consulta.",
        "O uso do aplicativo implica concordância com todas as regras.",
        "O descumprimento das regras pode gerar penalidades esportivas, financeiras ou administrativas."
      ]
    },
    {
      id: "consideracoes",
      title: "Considerações Finais",
      content: [
        "As regras podem ser alteradas sempre que necessário.",
        "Qualquer alteração será comunicada aos participantes.",
        "O objetivo do MFC é manter organização, transparência e um ambiente saudável."
      ]
    }
  ];

  const renderContent = (section: typeof sections[0]) => {
    if (section.isFormatted) {
      return (
        <div className="space-y-1">
          {section.content.map((line, index) => {
            if (line === "") {
              return <div key={index} className="h-2" />;
            }
            if (line.startsWith("**") && line.endsWith("**")) {
              return (
                <p key={index} className="font-semibold text-foreground mt-2">
                  {line.replace(/\*\*/g, "")}
                </p>
              );
            }
            if (line.startsWith("•")) {
              return (
                <p key={index} className="text-sm text-muted-foreground pl-4">
                  {line}
                </p>
              );
            }
            return (
              <p key={index} className="text-sm text-muted-foreground">
                {line}
              </p>
            );
          })}
        </div>
      );
    }

    return (
      <ul className="space-y-2">
        {section.content.map((rule, index) => (
          <li key={index} className="flex gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">•</span>
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <ScrollText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Regras do Clube</h1>
          <p className="text-sm text-muted-foreground">Regulamento oficial do MFC</p>
        </div>
      </div>

      {/* Accordion Rules */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <Accordion type="single" collapsible className="w-full">
            {sections.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  {renderContent(section)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Footer */}
      <Separator className="my-6" />
      <div className="text-center text-xs text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">MENTIRA FUTEBOL CLUBE</p>
        <p>Regulamento atualizado em Janeiro de 2025</p>
        <p className="mt-2 italic">"Jogar bem, jogar junto, jogar sempre!"</p>
      </div>
    </div>
  );
};

export default ClubRules;
