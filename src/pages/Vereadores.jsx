import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';

export default function Vereadores() {
  const navigate = useNavigate();

  const handleAvaliar = () => {
    navigate('/pesquisa-opiniao');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-bold text-on-surface">Desempenho Legislativo</h1>
          <p className="text-body-lg text-on-surface-variant mt-1">
            Acompanhe, avalie e participe das decisões do seu bairro.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-surface border border-outline px-4 py-2 rounded-lg font-bold text-on-surface flex items-center gap-2 hover:bg-surface-variant transition-colors">
            <Icon name="filter_list" className="text-sm" />
            Filtros Avançados
          </button>
          <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-colors">
            <Icon name="download" className="text-sm" />
            Exportar Relatório
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content - Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card Destaque: Seu Vereador Regional */}
          <div className="bg-surface rounded-2xl border border-outline-variant p-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
              SEU VEREADOR REGIONAL
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mt-2">
              <div className="relative">
                {/* Imagem Placeholder */}
                <div className="w-24 h-24 rounded-2xl bg-surface-variant overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200" 
                    alt="Dr. Marcos Valente"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-success text-on-primary w-8 h-8 rounded-full border-2 border-surface flex items-center justify-center">
                  <Icon name="verified" className="text-sm" />
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="text-headline-md font-bold text-on-surface">Dr. Marcos Valente</h2>
                <p className="text-body-md text-primary font-medium mt-1">
                  Regional Centro-Sul | Partido Renovação (PR)
                </p>
                
                <div className="flex gap-8 mt-4">
                  <div>
                    <div className="text-label-sm text-on-surface-variant">Presença</div>
                    <div className="text-title-lg font-bold text-success">98.5%</div>
                  </div>
                  <div>
                    <div className="text-label-sm text-on-surface-variant">Projetos Aprovados</div>
                    <div className="text-title-lg font-bold text-on-surface">12</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0">
                <button 
                  onClick={handleAvaliar}
                  className="bg-[#0b4d9c] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  Avaliar Agora
                  <Icon name="arrow_forward" className="text-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-4">
            <select className="flex-1 bg-surface border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
              <option>Filtrar por Regional (Todas)</option>
              <option>Centro-Sul</option>
              <option>Oeste</option>
              <option>Norte</option>
            </select>
            <select className="flex-1 bg-surface border border-outline-variant rounded-lg px-4 py-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary appearance-none">
              <option>Filtrar por Partido (Todos)</option>
              <option>PR</option>
              <option>PVG</option>
            </select>
          </div>

          {/* Grid de Outros Vereadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="bg-surface border border-outline-variant rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-variant">
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100" alt="Mariana Costa" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">Mariana Costa</h3>
                    <p className="text-label-sm text-on-surface-variant">PVG - Regional Oeste</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-success font-bold text-sm flex items-center justify-end gap-1">
                    <Icon name="trending_up" className="text-[16px]" /> 88%
                  </div>
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">Produtividade</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant font-medium">ÍNDICE DE APROVAÇÃO</span>
                  <span className="text-primary font-bold">Bom</span>
                </div>
                <div className="flex gap-1 h-2">
                  <div className="flex-1 bg-success rounded-l-sm"></div>
                  <div className="flex-1 bg-primary"></div>
                  <div className="flex-1 bg-surface-variant"></div>
                  <div className="flex-1 bg-error rounded-r-sm"></div>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-outline-variant">
                <button className="text-primary text-sm font-bold hover:underline">Ver Atividades</button>
                <button className="text-on-surface-variant text-sm flex items-center gap-1 hover:text-on-surface">
                  <Icon name="mail" className="text-[16px]" /> Contato
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-surface border border-outline-variant rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-variant">
                    <img src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=100&h=100" alt="Ricardo Souza" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface">Ricardo Souza</h3>
                    <p className="text-label-sm text-on-surface-variant">PR - Regional Norte</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-error font-bold text-sm flex items-center justify-end gap-1">
                    <Icon name="trending_down" className="text-[16px]" /> 62%
                  </div>
                  <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">Produtividade</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant font-medium">ÍNDICE DE APROVAÇÃO</span>
                  <span className="text-on-surface font-bold">Regular</span>
                </div>
                <div className="flex gap-1 h-2">
                  <div className="flex-1 bg-success rounded-l-sm"></div>
                  <div className="flex-1 bg-primary"></div>
                  <div className="flex-1 bg-surface-variant"></div>
                  <div className="flex-1 bg-surface-variant rounded-r-sm"></div>
                </div>
              </div>

              <div className="flex justify-between pt-3 border-t border-outline-variant">
                <button className="text-primary text-sm font-bold hover:underline">Ver Atividades</button>
                <button className="text-on-surface-variant text-sm flex items-center gap-1 hover:text-on-surface">
                  <Icon name="mail" className="text-[16px]" /> Contato
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Content - Right Column (1/3) */}
        <div className="space-y-6">
          
          {/* Card Desempenho Geral */}
          <div className="bg-surface border border-outline-variant rounded-2xl p-6">
            <h3 className="text-label-md font-bold text-on-surface-variant tracking-wider mb-6">
              DESEMPENHO GERAL DA CÂMARA
            </h3>

            <div className="space-y-6">
              <div>
                <div className="text-sm text-on-surface-variant">Projetos Aprovados (Ano)</div>
                <div className="flex items-end justify-between mt-1">
                  <div className="text-headline-md font-bold text-on-surface">142</div>
                  <div className="bg-success/20 text-success text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Icon name="arrow_upward" className="text-[14px]" /> 12%
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-on-surface-variant">Média de Presença</div>
                <div className="flex items-end justify-between mt-1">
                  <div className="text-headline-md font-bold text-on-surface">91.4%</div>
                  <div className="bg-surface-variant text-on-surface-variant text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Icon name="remove" className="text-[14px]" /> Estável
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-on-surface-variant">Verba Utilizada / Orçamento</div>
                <div className="flex items-end justify-between mt-1">
                  <div className="text-headline-md font-bold text-on-surface">R$ 2.4M</div>
                  <div className="bg-error/20 text-error text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Icon name="arrow_upward" className="text-[14px]" /> 4.5%
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant">
                <div className="text-xs text-on-surface-variant mb-3">Investimentos por Setor</div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Saúde</span>
                      <span className="font-bold">45%</span>
                    </div>
                    <div className="h-1.5 bg-surface-variant rounded-full overflow-hidden">
                      <div className="h-full bg-[#0b4d9c] w-[45%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Educação</span>
                      <span className="font-bold">32%</span>
                    </div>
                    <div className="h-1.5 bg-surface-variant rounded-full overflow-hidden">
                      <div className="h-full bg-success w-[32%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Infraestrutura</span>
                      <span className="font-bold">18%</span>
                    </div>
                    <div className="h-1.5 bg-surface-variant rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 w-[18%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Transparência */}
          <div className="bg-[#0b4d9c] text-white rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Icon name="shield" className="text-9xl" />
            </div>
            <h3 className="text-title-lg font-bold mb-2 relative z-10">Transparência Total</h3>
            <p className="text-sm text-white/80 mb-6 relative z-10 leading-relaxed">
              Todo cidadão tem direito a saber como os recursos públicos estão sendo aplicados.
            </p>
            <button className="bg-white text-[#0b4d9c] font-bold px-4 py-2 rounded-lg text-sm w-full md:w-auto hover:bg-white/90 transition-colors relative z-10">
              Acessar Dados Abertos
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
