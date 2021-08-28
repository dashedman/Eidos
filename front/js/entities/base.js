function Entity( name )
{
    this.name = name || null
    this.box = new PhBox()
    this.sprite = new Sprite()
}