import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';

export default function PesquisaOpiniao() {
  const navigate = useNavigate();
  const [transparencia, setTransparencia] = useState(0);
  const [engajamento, setEngajamento] = useState(0);
  const [projetos, setProjetos] = useState(0);
  const [verbas, setVerbas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (transparencia === 0 || engajamento === 0 || projetos === 0 || verbas === 0) {
      alert('Por favor, preencha todas as avaliações.');
      return;
    }
    
    setEnviado(true);
    setTimeout(() => {
      navigate('/vereadores');
    }, 3000);
  };

  const StarRatingBox = ({ title, description, icon, rating, onRatingChange }) => {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Icon name={icon} className="text-[#0b4d9c] text-lg" />
          <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">{title}</h4>
        </div>
        <p className="text-sm text-on-surface-variant mb-3">{description}</p>
        
        <div className="bg-surface-variant/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onRatingChange(star)}
                className={`transition-colors p-1 ${
                  rating >= star ? 'text-amber-400' : 'text-outline/40 hover:text-amber-200'
                }`}
              >
                <Icon name={rating >= star ? "star" : "star_border"} className="text-3xl" />
              </button>
            ))}
          </div>
          <div className="text-sm font-bold text-on-surface-variant">
            {rating > 0 ? rating : '-'} <span className="text-xs font-normal">/ 5</span>
          </div>
        </div>
      </div>
    );
  };

  if (enviado) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
        <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mb-6">
          <Icon name="check_circle" className="text-5xl" />
        </div>
        <h2 className="text-headline-md font-bold text-on-surface mb-2">Avaliação Enviada!</h2>
        <p className="text-body-lg text-on-surface-variant max-w-md">
          Sua contribuição é muito importante para a transparência. Redirecionando...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/vereadores')}
        className="flex items-center gap-2 text-xs font-bold text-[#0b4d9c] hover:underline uppercase tracking-wider"
      >
        <Icon name="arrow_back" className="text-sm" />
        Voltar para lista de vereadores
      </button>

      {/* Alderman Profile Card */}
      <div className="bg-surface border border-outline-variant rounded-xl p-6 flex flex-col md:flex-row justify-between items-center md:items-start gap-6 shadow-sm">
        <div className="flex gap-6 items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-variant shadow-inner">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200" 
                alt="Ricardo Silva"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-success text-on-primary w-6 h-6 rounded-full border-2 border-surface flex items-center justify-center">
              <Icon name="verified" className="text-[12px]" />
            </div>
          </div>
          <div>
            <h2 className="text-headline-sm font-bold text-on-surface">Ricardo Silva</h2>
            <p className="text-sm font-bold text-[#0b4d9c] uppercase tracking-wider mt-1">
              PARTIDO DA RENOVAÇÃO (PRN)
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-on-surface-variant">
              <div className="flex items-center gap-1">
                <Icon name="location_on" className="text-[16px]" />
                Regional Norte
              </div>
              <div className="flex items-center gap-1">
                <Icon name="event" className="text-[16px]" />
                Mandato: 2021-2024
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-variant/20 rounded-xl p-4 flex flex-col items-center justify-center min-w-[120px]">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Nota Geral</span>
          <span className="text-title-lg font-bold text-[#0b4d9c]">4.2</span>
          <div className="flex text-amber-400 text-[10px] mt-1">
            <Icon name="star" />
            <Icon name="star" />
            <Icon name="star" />
            <Icon name="star" />
            <Icon name="star_half" />
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        
        {/* Blue Header */}
        <div className="bg-[#0b4d9c] text-white px-6 py-4 flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-wider">Pesquisa de Desempenho Parlamentar</h3>
          <div className="bg-white/20 px-3 py-1 rounded text-xs font-bold">Passo 1 de 1</div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Sua avaliação é anônima e fundamental para a transparência do processo democrático. Por favor, 
            atribua uma nota de 1 a 5 para cada critério abaixo.
          </p>

          <form onSubmit={handleSubmit} className="space-y-2">
            
            <StarRatingBox 
              title="Transparência"
              description="Clareza na prestação de contas e divulgação de atividades."
              icon="visibility"
              rating={transparencia}
              onRatingChange={setTransparencia}
            />

            <StarRatingBox 
              title="Engajamento Comunitário"
              description="Presença na regional e diálogo constante com os moradores."
              icon="forum"
              rating={engajamento}
              onRatingChange={setEngajamento}
            />

            <StarRatingBox 
              title="Projetos Legislativos"
              description="Qualidade e relevância das leis e pautas propostas."
              icon="account_balance"
              rating={projetos}
              onRatingChange={setProjetos}
            />

            <StarRatingBox 
              title="Uso de Verbas Públicas"
              description="Responsabilidade e parcimônia no uso da verba de gabinete."
              icon="payments"
              rating={verbas}
              onRatingChange={setVerbas}
            />

            <div className="pt-4">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3">Comentários e Sugestões Qualitativas</h4>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                className="w-full bg-surface-variant/20 border border-outline-variant rounded-lg p-4 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#0b4d9c] focus:border-transparent transition-shadow resize-y"
                placeholder="O que você gostaria de dizer para este vereador? Sinta-se à vontade para detalhar sua avaliação..."
              />
              <p className="text-xs text-on-surface-variant italic mt-2">
                Seu comentário passará por uma moderação automática para garantir o respeito mútuo.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-8 mt-8 border-t border-outline-variant gap-6">
              <div className="flex items-center gap-2 text-xs text-success font-medium">
                <Icon name="gpp_good" className="text-lg" />
                Dados processados com criptografia ponta-a-ponta.
              </div>
              
              <button
                type="submit"
                className="bg-[#0b4d9c] hover:bg-[#0b4d9c]/90 text-white font-bold py-3 px-8 rounded-lg shadow-sm transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                ENVIAR AVALIAÇÃO
                <Icon name="send" className="text-sm" />
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Footer text */}
      <div className="text-center pb-8">
        <p className="text-[11px] text-on-surface-variant/70 max-w-2xl mx-auto leading-relaxed">
          O GovDigital segue as diretrizes da Lei Geral de Proteção de Dados (LGPD). Suas informações individuais nunca 
          serão compartilhadas com os vereadores avaliados.
        </p>
      </div>
    </div>
  );
}
