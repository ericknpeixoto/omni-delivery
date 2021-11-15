module.exports = {

  statusPedidoPipe: (numStatus) => {
  
    switch (numStatus) {
      case 1: return 'Preparo';
      case 2: return 'Saiu para entrega';
      case 3: return 'Entregue';
      case 4: return 'Cancelado';
      default: return'Indefinido';
    }
  }
}


