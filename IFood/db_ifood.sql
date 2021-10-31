DROP DATABASE IF EXISTS db_ifood;
CREATE DATABASE db_ifood;
USE db_ifood;

CREATE TABLE tb_cliente (
	cpf CHAR(11),
    nome VARCHAR(30) NOT NULL,
    sobrenome VARCHAR(200) NOT NULL,
    dataNascimento DATE NOT NULL,
    logradouro VARCHAR(200) NOT NULL,
    numeroEndereco INT NOT NULL,
    complementoEndereco VARCHAR(100),
    bairro VARCHAR(50) NOT NULL,
    cidade VARCHAR(50) NOT NULL,
    uf CHAR(2) NOT NULL,
    cep CHAR(8) NOT NULL,
    
    CONSTRAINT pk_cpfCliente PRIMARY KEY (cpf)
);

CREATE TABLE tb_restaurante (
	cnpj CHAR(14),
    nomeFantasia VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(11) NOT NULL,
    dataCadastro DATE NOT NULL,
    urlOpenDelivery VARCHAR(200),
    logradouro VARCHAR(200) NOT NULL,
    numeroEndereco INT NOT NULL,
    complementoEndereco VARCHAR(100),
    bairro VARCHAR(50) NOT NULL,
    cidade VARCHAR(50) NOT NULL,
    uf CHAR(2) NOT NULL,
    cep CHAR(8) NOT NULL,
    contaAtiva TINYINT NOT NULL,
    estabelecimentoAberto TINYINT NOT NULL,
    
    CONSTRAINT pk_cnpj PRIMARY KEY (cnpj)
);

CREATE TABLE tb_item (
	idItem BIGINT AUTO_INCREMENT,
    cnpj CHAR(14) NOT NULL,
    numItemAPI BIGINT,
    nome VARCHAR(30) NOT NULL,
    descricao VARCHAR(50) NOT NULL,
    precoUnitario DOUBLE NOT NULL,
    
    CONSTRAINT pk_idItem PRIMARY KEY (idItem),
    CONSTRAINT fk_cnpjRestaurante FOREIGN KEY (cnpj) REFERENCES tb_restaurante (cnpj)
);

CREATE TABLE tb_pedido (
	idPedido BIGINT AUTO_INCREMENT,
    cnpj CHAR(14) NOT NULL,
    cpf CHAR(11) NOT NULL,
    custo DOUBLE,
    desconto DOUBLE,
    custoFinal DOUBLE,
    horaPedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
    horaSaida DATETIME,
    horaEntrega DATETIME,
    statusPedido SMALLINT NOT NULL DEFAULT 0,
    logradouro VARCHAR(200) NOT NULL,
    numeroEndereco INT NOT NULL,
    complementoEndereco VARCHAR(100),
    bairro VARCHAR(50) NOT NULL,
    cidade VARCHAR(50) NOT NULL,
    uf CHAR(2) NOT NULL,
    cep CHAR(8) NOT NULL,
    
    CONSTRAINT pk_idPedido PRIMARY KEY (idPedido),
    CONSTRAINT fk_restaurante FOREIGN KEY (cnpj) REFERENCES tb_restaurante (cnpj),
    CONSTRAINT fk_cliente FOREIGN KEY (cpf) REFERENCES tb_cliente (cpf)
);

CREATE TABLE tb_itemPedido (
	idItem BIGINT,
    idPedido BIGINT,
    quantidade SMALLINT NOT NULL,
    precoUnitario DOUBLE NOT NULL,
    subTotal DOUBLE NOT NULL,
    
    CONSTRAINT pk_itemPedido PRIMARY KEY (idItem, idPedido),
    CONSTRAINT fk_pedido FOREIGN KEY (idPedido) REFERENCES tb_pedido (idPedido)
);

INSERT INTO tb_cliente VALUES
("11111111111", "Ricardo", "dos Santos", "1978-06-12", "Rua X", 123, "", "Bairro 1", "Cidade 1", "SP", "24412081"),
("22222222222", "Joana", "da Silva", "2000-12-03", "Rua Y", 456, "BL 9 AP 13", "Bairro 11", "Cidade 7", "RJ", "01258192"),
("33333333333", "Leandro", "Menezes", "1992-01-08", "Rua Z", 789, "", "Bairro 5", "Cidade 4", "PE", "9002851");

INSERT INTO tb_restaurante VALUES ("11111111111111", "Pizzaria do Zé", "pizzariadoze@outlook.com", "11984144108", "2019-07-04",
									"", "Rua H", 9812, "", "Bairro 9", "Cidade 10", "SP", "55921029", 1, 1);

INSERT INTO tb_restaurante VALUES ("22222222222222", "Comida Japonesa", "atendimento@comidajaponesa.com", "2147182851", current_date(),
									"", "Rua Y", 14, "", "Bairro 5", "Cidade 2", "RJ", "51251982", 1, 0);
                                    
INSERT INTO tb_item VALUES (NULL, "11111111111111", NULL, "Pizza de Calabresa", "É uma pizza feita com...calabresa", 29.99),
						   (NULL, "22222222222222", 1, "Sushi", "Porção de Sushi", 21.99);

INSERT INTO tb_pedido VALUES 
(NULL, "11111111111111", "11111111111", 29.99, 0, 29.99, "2021-10-31 17:20:11", "2021-10-31 17:40:11", "2021-10-31 17:50:11", 4, "Rua X", 123, "", "Bairro 1", "Cidade 1", "SP", "24412081" ),
(NULL, "22222222222222", "22222222222", 21.99, 0, 21.99, "2021-10-31 17:20:11", "2021-10-31 17:40:11", "2021-10-31 17:50:11", 4, "Rua Y", 456, "BL 9 AP 13", "Bairro 11", "Cidade 7", "RJ", "01258192" );

INSERT INTO tb_itemPedido VALUES (1, 1, 1, 29.99, 29.99), (2, 2, 1, 21.99, 21.99);

DELIMITER //
CREATE TRIGGER tr_custoPedido AFTER INSERT ON tb_itemPedido FOR EACH ROW
BEGIN
	UPDATE tb_pedido SET custo = (SELECT SUM(subtotal) FROM tb_itemPedido WHERE idPedido = NEW.idPedido;
    UPDATE tb_pedido SET custoFinal = custo - desconto WHERE idPedido = NEW.idPedido;
END;
DELIMITER ;