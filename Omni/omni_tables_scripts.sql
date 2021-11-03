CREATE DATABASE omni_delivery;

USE omni_delivery;

CREATE TABLE IF NOT EXISTS tb_restaurante(
	cnpj BIGINT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    descricao VARCHAR(200),
    logradouro VARCHAR(200),
    numero INT NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL,
    cep INT NOT NULL,
    complemento VARCHAR(100)
);


CREATE TABLE IF NOT EXISTS tb_item_cardapio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    detalhes VARCHAR(200),
    preco DOUBLE,
    is_disponivel BIT
);


CREATE TABLE IF NOT EXISTS tb_plataforma_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    url_contato VARCHAR(200),
    situacao VARCHAR(100),
    dt_atualizacao DATETIME
);


CREATE TABLE IF NOT EXISTS tb_pedido(
	id INT AUTO_INCREMENT,
    cnpj_restaurante BIGINT NOT NULL,
    id_plataforma int NOT NULL,
    num_pedido_plataforma BIGINT NOT NULL, 
    custo DOUBLE NOT NULL, 
    desconto DOUBLE, 
    frete DOUBLE, 
    total Double,
    endereco_entrega VARCHAR(255) NOT NULL, 
    situacao VARCHAR(100),
    PRIMARY KEY(id, cnpj_restaurante),
    CONSTRAINT fk_id_plataforma FOREIGN KEY (id_plataforma) REFERENCES tb_plataforma_pedido(id)
);


CREATE TABLE IF NOT EXISTS tb_item_pedido (
    id_pedido INT NOT NULL,
    id_item_cardapio INT NOT NULL, 
    preco DOUBLE,
    quantidade INT,
    PRIMARY KEY (id_pedido, id_item_cardapio),
    CONSTRAINT fk_pedido FOREIGN KEY (id_pedido) REFERENCES tb_pedido(id),
    CONSTRAINT fk_item_cardapio FOREIGN KEY (id_item_cardapio) REFERENCES tb_item_cardapio(id)
);


INSERT INTO tb_restaurante (cnpj, nome, descricao, logradouro, numero, bairro, cidade, uf, cep, complemento)
			         VALUES(42388433000106, '7 Mares', 'Um restaurante que possuí diversos pratos com a maior variedade de frutos do mar', null, 22, 'Santa Paula', 'São Caetano do Sul', 'SP', '04297251', null);
                     
                     
                     
                     
