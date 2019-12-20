function auto() {
    var heroListData = localStorage.getItem(localCache + 'RentHero');
    var skinListData = localStorage.getItem(localCache + 'RentSkin');
    heroListData = JSON.parse(heroListData);
    skinListData = JSON.parse(skinListData);
    var AllHeroSkinData = localStorage.getItem(localCache + 'AllHeroSkinData');
    if (AllHeroSkinData == null) {
        console.log(" 缺少数据 英雄皮肤 取消渲染");
        alert("缺少数据");
        // window.location.href = allAjaxUrl.H5_Search;   //无数据去列表
        return;
    }
    var HeroList = {}, SkinList = {};
    heroListData.forEach(function (val) {
        HeroList[val] = val;
    });
    skinListData.forEach(function (val) {
        SkinList[val] = val;
    });
    console.log(HeroList);
    console.log(SkinList);

    var HeorId, HeorIndex = -1, SkinIndex = -1;
    //改英雄已有的皮肤数量
    var rentSkinNumber;
    HeroSkinData = {};
    $(JSON.parse(AllHeroSkinData).reverse()).each(function () {
        if (HeroList[this.heroId]) {
            //有英雄显示
            if (HeorId == this.heroId) {
                //添加皮肤
                ++SkinIndex;
                HeroSkinData[HeorIndex].skin[SkinIndex] = {}
                HeroSkinData[HeorIndex].skin[SkinIndex].skinId = this.skinId;
                HeroSkinData[HeorIndex].skin[SkinIndex].sDes = this.sDes;
                if (SkinList[this.skinId]) {
                    HeroSkinData[HeorIndex].skin[SkinIndex].sImg = allAjaxUrl.imgSrc + this.sImg;
                    if (rentSkinNumber >= 1) {
                        ++rentSkinNumber;
                    } else {
                        //新英雄重置
                        rentSkinNumber = 1;
                    }
                    //改英雄已有的皮肤数量
                    HeroSkinData[HeorIndex].SkinNumber = rentSkinNumber
                }else{
                    HeroSkinData[HeorIndex].skin[SkinIndex].sImg = 1;
                }
                //该英雄皮肤总数
                HeroSkinData[HeorIndex].SkinAll = HeroSkinData[HeorIndex].SkinAll+1
            } else {
                //创建英雄
                ++HeorIndex;
                HeorId = this.heroId;
                HeroSkinData[HeorIndex] = {}
                HeroSkinData[HeorIndex].heroId = this.heroId;
                HeroSkinData[HeorIndex].hDes = this.hDes;
                HeroSkinData[HeorIndex].hImg = allAjaxUrl.imgSrc + this.hImg;
                //添加第一个皮肤
                SkinIndex = this.skinId;
                HeroSkinData[HeorIndex].skin = []
                HeroSkinData[HeorIndex].skin[SkinIndex] = {}
                HeroSkinData[HeorIndex].skin[SkinIndex].skinId = this.skinId;
                HeroSkinData[HeorIndex].skin[SkinIndex].sDes = this.sDes;
                if (SkinList[this.skinId]) {
                    //新英雄重置
                    rentSkinNumber = 1;
                    HeroSkinData[HeorIndex].skin[SkinIndex].sImg = allAjaxUrl.imgSrc + this.sImg;
                    //改英雄已有的皮肤数量
                    HeroSkinData[HeorIndex].SkinNumber = rentSkinNumber
                }else{
                    HeroSkinData[HeorIndex].skin[SkinIndex].sImg = 1;
                }
                //该英雄皮肤总数
                HeroSkinData[HeorIndex].SkinAll = 1
            }
        }
    });
    console.log(HeroSkinData)
    var heroSkinList = {}
    heroSkinList.data = HeroSkinData
    var html = template('heroSkinBox_at', heroSkinList);
    document.getElementById('heroSkinBox').innerHTML = html;
}
auto();