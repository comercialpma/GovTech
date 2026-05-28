import React, { useState } from 'react';
import Icon from '../components/Icon.jsx';

export default function PesquisaOpiniao() {
  const [vereadorId, setVereadorId] = useState('');
  const [notaGeral, setNotaGeral] = useState(0);
  const [notaSaude, setNotaSaude] = useState(0);
  const [notaEducacao, setNotaEducacao] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado] = useState(false);

  // Mock de vereadores para o select
  const vereadores = [
    { id: '1', nome: 'Ricardo Mendes', partido: 'PSD' },
    { id: '2', nome: 'Ana Paula Vaz', partido: 'PT' },
    { id: '3', nome: 'Sérgio Freitas', partido: 'MDB' },
    { id: '4', nome: 'Carla Nogueira', partido: 'PSDB' },
    { id: '5', nome: 'João Batista', partido: 'PL' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!vereadorId || notaGeral === 0) {
      alert('Por favor, selecione um vereador e dê uma nota geral.');
      return;
    }
    
    // Aqui seria a chamada à API para salvar a pesquisa
    console.log({ vereadorId, notaGeral, notaSaude, notaEducacao, comentario });
    
    setEnviado(true);
    // Limpar o formulário após alguns segundos para demonstrar
    setTimeout(() => {
      setVereadorId('');
      setNotaGeral(0);
      setNotaSaude(0);
      setNotaEducacao(0);
      setComentario('');
      setEnviado(false);
    }, 3000);
  };

  const StarRating = ({ rating, onRatingChange, label }) => {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-label-md font-bold text-on-surface">{label}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onRatingChange(star)}
              className={`transition-colors p-1 ${
                rating >= star ? 'text-amber-500' : 'text-outline hover:text-amber-300'
              }`}
            >
              <Icon name="star" className="text-2xl" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-sm font-bold text-on-surface">Pesquisa de Opinião</h1>
        <p className="text-body-lg text-on-surface-variant mt-2 max-w-3xl">
          Sua opinião é fundamental para a construção de um mandato mais transparente e participativo.
          Avalie a atuação do seu vereador e deixe suas sugestões.
        </p>
      </div>

      <div className="bg-surface border border-outline-variant rounded-2xl p-6 md:p-8 max-w-4xl shadow-sm">
        {enviado ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
              <Icon name="check_circle" className="text-4xl" />
            </div>
            <h2 className="text-headline-sm font-bold text-on-surface mb-2">Avaliação Enviada!</h2>
            <p className="text-body-lg text-on-surface-variant">
              Agradecemos sua participação. Sua opinião foi registrada com sucesso.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
            
            <div className="space-y-2">
              <label htmlFor="vereador" className="text-label-md font-bold text-on-surface block">
                Selecione o Parlamentar
              </label>
              <div className="relative">
                <select
                  id="vereador"
                  value={vereadorId}
                  onChange={(e) => setVereadorId(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md text-on-surface appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                >
                  <option value="" disabled>Escolha um vereador da lista...</option>
                  {vereadores.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nome} - {v.partido}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-on-surface-variant">
                  <Icon name="arrow_drop_down" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-title-lg font-bold text-on-surface border-b border-outline-variant pb-2">
                Avaliação da Atuação
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <StarRating 
                  label="Avaliação Geral do Mandato *" 
                  rating={notaGeral} 
                  onRatingChange={setNotaGeral} 
                />
                
                <StarRating 
                  label="Atuação na Saúde" 
                  rating={notaSaude} 
                  onRatingChange={setNotaSaude} 
                />
                
                <StarRating 
                  label="Atuação na Educação" 
                  rating={notaEducacao} 
                  onRatingChange={setNotaEducacao} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="comentario" className="text-label-md font-bold text-on-surface block">
                Comentários ou Sugestões (Opcional)
              </label>
              <textarea
                id="comentario"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow resize-y"
                placeholder="Deixe aqui seu comentário, sugestão ou crítica para o parlamentar..."
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-8 rounded-full shadow-sm hover:shadow transition-all flex items-center gap-2 active:scale-95"
              >
                <Icon name="send" className="text-sm" />
                Enviar Avaliação
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
