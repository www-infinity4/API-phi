const clean=s=>String(s??"").trim();
function stable(value){if(Array.isArray(value))return "["+value.map(stable).join(",")+"]";if(value&&typeof value==="object")return "{"+Object.keys(value).sort().map(k=>JSON.stringify(k)+":"+stable(value[k])).join(",")+"}";return JSON.stringify(value)}
async function digest(v){const b=new TextEncoder().encode(stable(v)),h=await crypto.subtle.digest("SHA-256",b);return [...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("")}

/**
 * Normalize untrusted provider data into an initializing RED Quant envelope.
 * External payloads never receive lifecycle authority.
 */
export async function normalize(input={},options={}){
  const provider=clean(options.provider||input.provider||"external");
  const topic=clean(options.topic||input.topic||input.title||input.name);
  if(!topic) throw new TypeError("topic_required");
  const projectId=clean(options.projectId||input.projectId);
  if(!projectId) throw new TypeError("project_id_required");
  const source={provider,externalId:clean(options.externalId||input.id),url:clean(options.url||input.url),receivedAt:new Date().toISOString()};
  const sourceIdentity=await digest({projectId,provider,externalId:source.externalId,url:source.url,topic});
  return {
    id:"apiq_"+sourceIdentity.slice(0,32),
    projectId,topic,scope:clean(options.scope||topic),scopeField:"RED",
    lifecycleStage:"RED",stage:"RED",
    parentEnclosureId:clean(options.parentEnclosureId),
    sourceIdentity,source,
    data:options.map?await options.map(input):input,
    media:Array.isArray(options.media)?options.media:[],
    createdAt:source.receivedAt,
    stageHistory:[{stage:"RED",at:source.receivedAt,authority:"api-phi-ingress"}]
  };
}

export function assertIngressQuant(q){
  if(!q||q.scopeField!=="RED"||q.lifecycleStage!=="RED") throw new TypeError("invalid_ingress_quant");
  if(q.seal||q.lifecycleStage==="BLACK") throw new TypeError("external_seal_forbidden");
  return q;
}
