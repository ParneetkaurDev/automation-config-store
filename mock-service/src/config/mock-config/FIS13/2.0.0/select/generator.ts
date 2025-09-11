function createItemPayload(selectedItem: any): any {
  const itemPayload: any = {
    id: selectedItem.id,
   
  };

  if (selectedItem.parent_item_id) {
    itemPayload.parent_item_id = selectedItem.parent_item_id;
  }


  return itemPayload;
}

export async function selectDefaultGenerator(existingPayload: any, sessionData: any) {
  let selectedItem: any;
  existingPayload.context.location.city.code= sessionData?.city_code

  if(sessionData.items.length > 0){
     selectedItem = sessionData.items[1];
  }
  else{
     selectedItem = sessionData.items[0];
  }
   const selectedItemPayload = createItemPayload(selectedItem);

   existingPayload.message.order.items = [selectedItemPayload];
  existingPayload.message.order.provider.id = sessionData.provider_id;

 

  return existingPayload;
} 

