function skillsMember(){
    return {
        name: "SkillsMember",
        props: {
            name: {
                type: String,
                required: true
            },
            skill: {
                type: String,
                required: true
            }
        },
        template: `
        <div class="member">
            <h3>{{ name }}</h3>
            <p>{{ skill }}</p>
        </div>
        `
    }
}
