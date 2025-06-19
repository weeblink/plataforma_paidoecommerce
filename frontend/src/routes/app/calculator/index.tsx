import { useState } from "react";

type InputGroupProps = {
  label: string;
  tooltip: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
};

const InputGroup = ({
  label,
  tooltip,
  value,
  onChange,
  prefix,
  suffix,
  placeholder = "0,00"
}: InputGroupProps) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-white">{label}</label>
        <button 
          type="button"
          className="w-5 h-5 bg-gray-400 text-white rounded-full text-xs flex items-center justify-center hover:bg-gray-500 transition-colors"
          title={tooltip}
        >
          i
        </button>
      </div>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
          style={{
            paddingLeft: prefix ? '2.5rem' : '0.75rem',
            paddingRight: suffix ? '2.5rem' : '0.75rem'
          }}
        />
        {prefix && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            {prefix}
          </span>
        )}
        {suffix && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            {suffix}
          </span>
        )}
      </div>
    </div>
);

export default function CalculatorPage(){

    const [formData, setFormData] = useState({
    custoProduto: '',
    icmsProduto: '',
    custoFrete: '',
    custoOperacional: '',
    impostoVenda: '',
    taxaPlataforma: '',
    custoEnvio: '',
    custoFixo: '',
    lucroDesejado: ''
  });

  const [suggestedPrice, setSuggestedPrice] = useState('0,00');
  const [realProfit, setRealProfit] = useState('');

  const handleInputChange = (field: any, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (value: any) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const parseValue = (value: any) => {
    return parseFloat(value.replace(',', '.')) || 0;
  };

  const calculateFixedCost = (
    custoProduto: number, 
    icms: number, 
    custoFrete: number, 
    custoVenda: number, 
    custoEnvio: number
    ): number => {
    const costIcms = custoProduto * icms;
    const costFrete = custoProduto * custoFrete;
    
    return custoProduto + costIcms + costFrete + custoVenda + custoEnvio;
    };

    // Helper function to find minimum price using iterative approach
    const getMinPrice = (
    custoFixo: number, 
    custosVariaveis: number, 
    lucroDesejado: number
    ): number => {
    let findMinPrice = false;
    let suggestedPrice = custoFixo;

    while (!findMinPrice) {
        const tmp = suggestedPrice - custoFixo - (suggestedPrice * custosVariaveis);
        
        if (tmp >= (suggestedPrice * lucroDesejado) && tmp <= ((suggestedPrice * lucroDesejado) + 0.5)) {
        findMinPrice = true;
        } else if (tmp > suggestedPrice * lucroDesejado) {
        suggestedPrice -= 0.1;
        } else {
        suggestedPrice += 5;
        }
    }

    return suggestedPrice;
    };

    const calculateSuggestedPrice = () => {
        const custo = parseValue(formData.custoProduto);
        const icms = parseValue(formData.icmsProduto) / 100;
        const frete = parseValue(formData.custoFrete) / 100;
        const operacional = parseValue(formData.custoOperacional) / 100;
        const imposto = parseValue(formData.impostoVenda) / 100;
        const taxaPlat = parseValue(formData.taxaPlataforma) / 100;
        const envio = parseValue(formData.custoEnvio);
        const fixo = parseValue(formData.custoFixo);
        const lucro = parseValue(formData.lucroDesejado) / 100;

        // Calculate fixed costs using the original logic
        const fixedCost = calculateFixedCost(custo, icms, frete, fixo, envio);
        
        // Calculate variable costs (as percentages)
        const variableCost = operacional + imposto + taxaPlat;
        
        // Find the minimum price using the iterative algorithm
        const suggestedPrice = getMinPrice(fixedCost, variableCost, lucro);
        
        // Update the UI with formatted results
        setSuggestedPrice(formatCurrency(suggestedPrice));
        
        // Calculate real profit in monetary value (as in original code)
        const lucroReal = suggestedPrice * lucro;
        setRealProfit(lucroReal.toFixed(2));
        
        console.log(suggestedPrice.toFixed(2));
    };

  return (
    <div>
        <h1 className="font-poppins text-2xl font-medium">Calculadora de Preço</h1>
        <div className="max-w-7xl mx-auto pt-12">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InputGroup
                label="Custo base do produto"
                tooltip="Aqui você deve inserir o preço que o seu produto custa no momento da compra"
                value={formData.custoProduto}
                onChange={(value: any) => handleInputChange('custoProduto', value)}
                prefix="R$"
                suffix={''}
                />
                <InputGroup
                label="ICMS (compra interestadual)"
                tooltip="Esse campo deve ser inserido caso você realize a compra do seu produto de outro estado"
                value={formData.icmsProduto}
                onChange={(value: any) => handleInputChange('icmsProduto', value)}
                prefix={''}
                suffix="%"
                />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InputGroup
                label="Custo frete (FOB)"
                tooltip="Aqui você deve inserir o frete que você paga para o produto chegar até a sua empresa"
                value={formData.custoFrete}
                onChange={(value:any) => handleInputChange('custoFrete', value)}
                suffix="%"
                prefix={''}
                />
                <InputGroup
                label="Custo operacional"
                tooltip="Aqui você deve atribuir uma alíquota ideal para o seu negócio de custo operacional"
                value={formData.custoOperacional}
                onChange={(value:any) => handleInputChange('custoOperacional', value)}
                suffix="%"
                prefix={''}
                />
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InputGroup
                label="Imposto sobre a venda (NFe de saída)"
                tooltip="Aqui você insere a sua alíquota de imposto que está pagando nas suas vendas"
                value={formData.impostoVenda}
                onChange={(value:any) => handleInputChange('impostoVenda', value)}
                suffix="%"
                prefix={''}
                />
                <InputGroup
                label="Taxa da plataforma"
                tooltip="Insira a taxa que a plataforma cobra para você vender os produtos"
                value={formData.taxaPlataforma}
                onChange={(value:any) => handleInputChange('taxaPlataforma', value)}
                suffix="%"
                prefix={''}
                />
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InputGroup
                label="Frete da plataforma"
                tooltip="Apenas para produtos ACIMA de R$ 79"
                value={formData.custoEnvio}
                onChange={(value: any) => handleInputChange('custoEnvio', value)}
                prefix="R$"
                suffix={''}
                />
                <InputGroup
                label="Taxa fixa da plataforma"
                tooltip="Apenas para produtos ABAIXO de R$ 79"
                value={formData.custoFixo}
                onChange={(value:any) => handleInputChange('custoFixo', value)}
                prefix="R$"
                suffix={''}
                />
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <InputGroup
                label="Lucro desejado"
                tooltip="Insira a porcentagem de lucro desejado para a venda desse produto"
                value={formData.lucroDesejado}
                onChange={(value:any) => handleInputChange('lucroDesejado', value)}
                suffix="%"
                prefix={''}
                />
                <div></div> {/* Empty div for grid alignment */}
            </div>

            {/* Calculate Button */}
            <div className="text-center mb-8">
                <button className="px-8 py-3 bg-orange-400 hover:bg-orange-500 text-white font-bold rounded-lg transition-colors duration-200 min-w-48" onClick={calculateSuggestedPrice}>
                Calcular
                </button>
            </div>

            {/* Result */}
            <div className="text-center">
                <h4 className="text-xl font-semibold text-white mb-2">
                    Preço mínimo sugerido
                </h4>
                <p className="text-2xl font-bold text-green-600 mb-1">
                R$ {suggestedPrice}
                </p>
                <p className="text-sm text-gray-500">
                Lucro real: R$ {realProfit || '0,00'}
                </p>
            </div>
        </div>
    </div>
  );
}