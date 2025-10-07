export async function onSearchGenerator(existingPayload: any, sessionData: any) {
    existingPayload.context.location.city.code= sessionData?.city_code

    existingPayload.message.catalog.providers  =  existingPayload.message.catalog.providers.filter((provider: { id: any; })=>provider.id === sessionData.provider_id) 
    existingPayload.message.catalog.providers.forEach((provider: { tags: any; })=>{
         provider.tags=[sessionData.tags]
    })
    return existingPayload;
} 