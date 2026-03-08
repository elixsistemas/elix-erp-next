## Carrier Vehicles

Permissões adicionadas para controle de veículos de transportadoras.

```sql
INSERT INTO permissions (code, description, module)
VALUES
('carrier_vehicles.read','Listar veículos de transportadoras','cadastros'),
('carrier_vehicles.create','Criar veículo de transportadora','cadastros'),
('carrier_vehicles.update','Editar veículo de transportadora','cadastros'),
('carrier_vehicles.delete','Remover veículo de transportadora','cadastros');

Módulo relacionado:

cadastros.carriers