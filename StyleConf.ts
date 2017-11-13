export const StyleConf = {
    primary: '#414c94',
    navbarheight: 64
};

export const navOptions = (title: string, options?: any) => {
    const result = {
        title: title,
        headerTintColor: 'white',
        headerStyle: {
            backgroundColor: '#414c94'
        },
        headerTitleStyle: {
            alignSelf: 'center'
        }
    };

    if(options){
        Object.assign(result, options);
    }
    
    return result;
}