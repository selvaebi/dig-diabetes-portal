package dport.mgr

import org.codehaus.groovy.grails.web.json.JSONObject

class GooglePlusController {

    def index() {}

    def userLoginAjax() {
        String userId = params.userId
        if (userId)      {
            JSONObject jsonObject =  restServerService.retrieveGeneInfoByName (geneToStartWith.trim().toUpperCase())
            render(status:200, contentType:"application/json") {
                [geneInfo:jsonObject['gene-info']]
            }

        }
//        GSON.toJ
//        GoogleTokenResponse
    }

}
