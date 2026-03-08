# Carriers (Transportadoras)

Módulo responsável pelo cadastro de transportadoras utilizadas em processos de logística, frete e emissão de documentos fiscais.

## Tabelas

### carriers

Cadastro principal das transportadoras.

| Campo | Tipo | Descrição |
|------|------|-----------|
| id | bigint | Identificador da transportadora |
| company_id | bigint | Empresa proprietária do cadastro |
| legal_name | nvarchar | Razão social |
| trade_name | nvarchar | Nome fantasia |
| document_number | nvarchar | CPF/CNPJ |
| email | nvarchar | Email de contato |
| phone | nvarchar | Telefone |
| street | nvarchar | Logradouro |
| number | nvarchar | Número |
| complement | nvarchar | Complemento |
| district | nvarchar | Bairro |
| city | nvarchar | Cidade |
| state | nvarchar | UF |
| zip_code | nvarchar | CEP |
| country | nvarchar | País |
| active | bit | Status |
| created_at | datetime2 | Data de criação |
| updated_at | datetime2 | Data de atualização |

---

### carrier_vehicles

Veículos vinculados às transportadoras.

| Campo | Tipo | Descrição |
|------|------|-----------|
| id | bigint | Identificador |
| company_id | bigint | Empresa |
| carrier_id | bigint | Transportadora |
| plate | nvarchar | Placa |
| model | nvarchar | Modelo |
| brand | nvarchar | Marca |
| vehicle_type | nvarchar | Tipo |
| body_type | nvarchar | Carroceria |
| rntrc | nvarchar | RNTRC |
| state | nvarchar | UF |
| active | bit | Status |
| created_at | datetime2 | Data criação |
| updated_at | datetime2 | Data atualização |

---

## Relacionamento


carriers (1) ──── (N) carrier_vehicles


Uma transportadora pode possuir múltiplos veículos cadastrados.

---

## Permissões

| Permissão | Descrição |
|----------|-----------|
| carriers.read | Listar transportadoras |
| carriers.create | Criar transportadora |
| carriers.update | Editar transportadora |
| carriers.delete | Remover transportadora |
| carrier_vehicles.read | Listar veículos |
| carrier_vehicles.create | Criar veículo |
| carrier_vehicles.update | Editar veículo |
| carrier_vehicles.delete | Remover veículo |

---

## Observações

- Endereço é preenchido automaticamente via **CEP lookup**.
- CPF/CNPJ pode ser preenchido automaticamente via **CNPJ lookup**.
- O cadastro foi padronizado para seguir o layout utilizado em **fornecedores e clientes**.