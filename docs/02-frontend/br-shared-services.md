# BR Shared Services (Frontend)

Este documento descreve os serviços e utilitários compartilhados utilizados para manipulação de dados brasileiros no frontend do **Elix ERP Next**.

Esses recursos centralizam regras de:

- CPF / CNPJ
- CEP
- máscaras
- sanitização de números
- cache de consultas externas
- debounce de buscas

Eles evitam duplicação de lógica e garantem consistência em todos os cadastros do ERP.

Localização no projeto:


apps/web/src/shared/br/


---

# Objetivo

Padronizar operações comuns relacionadas a dados brasileiros.

Esses serviços são usados principalmente em:

- Clientes
- Fornecedores
- Transportadoras
- Empresas
- Contatos
- Cadastros fiscais

---

# Estrutura do módulo

```
shared/br
├── cache
│   └── simpleCache.ts
├── hooks
│   ├── useCepLookup.ts
│   └── useDebouncedValue.ts
├── services
│   ├── brasilapi.ts
│   └── viacep.ts
├── digits.ts
└── masks.ts
```

---

# digits.ts

Utilitário para **remover caracteres não numéricos**.

Arquivo:

```
shared/br/digits.ts
```

Função principal:

```ts
onlyDigits(value: string): string
Exemplo
onlyDigits("12.345.678/0001-99")

Resultado:

12345678000199

Usado para:

CPF

CNPJ

telefone

CEP

RNTRC

IE

masks.ts

Contém funções de máscara visual para dados brasileiros.

Arquivo:

shared/br/masks.ts

Principais funções:

CPF
maskCPF("12345678901")

Resultado

123.456.789-01
CNPJ
maskCNPJ("12345678000199")

Resultado

12.345.678/0001-99
CEP
maskCep("12345678")

Resultado

12345-678
Telefone
maskPhoneBR("11987654321")

Resultado

(11) 98765-4321
simpleCache.ts

Cache simples em memória para evitar múltiplas chamadas a APIs externas.

Arquivo:

shared/br/cache/simpleCache.ts

Uso comum:

consultas de CNPJ

consultas de CEP

Benefícios

reduz chamadas externas

melhora performance

evita bloqueios de API pública

useDebouncedValue.ts

Hook React para debounce de valores.

Arquivo:

shared/br/hooks/useDebouncedValue.ts

Uso comum:

campo de busca

filtros de lista

chamadas API

Exemplo
const debounced = useDebouncedValue(search, 300);

Evita chamadas excessivas ao backend enquanto o usuário digita.

useCepLookup.ts

Hook para consulta automática de CEP.

Arquivo:

shared/br/hooks/useCepLookup.ts

Ele usa:

viacep

Fluxo:

CEP digitado
↓
remove máscara
↓
consulta API
↓
retorna endereço

Campos retornados:

logradouro
bairro
localidade
uf
complemento

Usado em:

clientes

fornecedores

transportadoras

empresas

viacep.ts

Serviço responsável por consultar CEP.

Arquivo:

shared/br/services/viacep.ts

Endpoint:

https://viacep.com.br/ws/{cep}/json/

Função principal:

fetchAddressByCep(cep)

Retorna:

logradouro
bairro
localidade
uf
complemento
brasilapi.ts

Serviço responsável por consulta de CNPJ.

Arquivo:

shared/br/services/brasilapi.ts

Endpoint:

https://brasilapi.com.br/api/cnpj/v1/{cnpj}

Função principal:

fetchCompanyByCnpj(cnpj)

Campos retornados mais comuns:

razao_social
nome_fantasia
email
telefone
logradouro
bairro
municipio
uf
cep
numero
Fluxo padrão recomendado

Para formulários que usam CNPJ e CEP.

CNPJ
usuario digita CNPJ
↓
remove mascara
↓
consulta brasilapi
↓
preenche dados basicos

Campos preenchidos automaticamente:

nome
email
telefone
endereco
cidade
estado
cep
CEP
usuario digita CEP
↓
remove mascara
↓
consulta viacep
↓
preenche endereco

Campos preenchidos automaticamente:

rua
bairro
cidade
estado
Boas práticas

Sempre:

sanitizar dados com onlyDigits

aplicar máscara apenas na exibição

usar debounce em buscas

usar simpleCache para evitar chamadas repetidas

validar tamanho mínimo antes de chamar API

Exemplo:

CNPJ só consultar se:

14 dígitos

CEP só consultar se:

8 dígitos
Onde usar

Esses serviços devem ser usados em:

cadastros de clientes
cadastros de fornecedores
cadastros de transportadoras
cadastros de empresas
qualquer entidade com endereço ou documento
Evoluções futuras

Este módulo poderá incluir:

validação CPF/CNPJ
validação IE
consulta CNAE
consulta município IBGE
cache persistente
fallback de APIs
Princípio de arquitetura

Todos os dados brasileiros devem passar pelo BR Shared Services.

Isso evita:

duplicação de código

inconsistência entre cadastros

bugs de máscara ou sanitização

Este módulo funciona como camada de infraestrutura do frontend.