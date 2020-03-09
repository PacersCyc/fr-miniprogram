// miniprogram/pages/new/new.js
const COLUMNS = ['锻造', '金工', '绞丝', '其他']

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    columns: COLUMNS,
    uploadCapture: ['album', 'camera'],
    username: '',
    responsible: '',
    workshop: '',
    procedure: '',
    equipment: '',
    descrption: '',
    imgList: [],
    cloudFilePaths: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  showPopup() {
    this.setData({
      show: true
    })
  },

  onClose() {
    this.setData({
      show: false
    })
  },

  onNameChange(e) {
    console.log(e.detail)
    this.setData({
      username: e.detail
    })
  },

  onResponsibleChange(e) {
    this.setData({
      responsible: e.detail
    })
  },

  onWorkShopConfirm(e) {
    console.log(e)
    this.setData({
      show: false,
      workshop: e.detail.value
    })
  },

  onWorkShopChange(e) {
    this.setData({
      workshop: e.detail
    })
  },

  onProcedureChange(e) {
    this.setData({
      procedure: e.detail
    })
  },

  onEquipmentChange(e) {
    this.setData({
      equipment: e.detail
    })
  },

  onDescrptionChange(e) {
    this.setData({
      descrption: e.detail
    })
  },

  deleteImg(e) {
    this.setData({
      imgList: this.data.imgList.filter((img, index) => index!==e.detail.index)
    })
  },

  afterRead(e) {
    wx.cloud.init()
    console.log(e)
    const { file } = e.detail
    this.setData({
      imgList: this.data.imgList.concat({...file[0], url: file[0].path})
    })
    // wx.cloud.uploadFile({
    //   cloudPath: `${Date.now()}.png`,
    //   filePath: file[0].path
    // }).then(res => {
    //   console.log(res)
    // }).catch(e => {
    //   console.error(e)
    // })
  },

  uploadFilePromise(name, file) {
    return wx.cloud.uploadFile({
      cloudPath: name,
      filePath: file.path
    })
  },

  uploadToCloud() {
    wx.cloud.init()
    const { imgList } = this.data
    if (!imgList.length) {
      wx.showToast({ title: '请选择图片', icon: 'none' });
    } else {
      const uploadTasks = imgList.map((img, index) => this.uploadFilePromise(`${Date.now()}-${index+1}.png`, img))
      Promise.all(uploadTasks).then(data => {
        wx.showToast({ title: '上传成功', icon: 'none' })
        console.log(data)
        this.setData({
          cloudFilePaths: data.map(item => item.fileID)
        })
        console.log(this.data.cloudFilePaths)
        this.createRecord()
      }).catch(e => {
        wx.showToast({ title: '上传失败', icon: 'none' })
        console.log(e)
      })
    }
  },

  createRecord() {
    const {
      username,
      responsible,
      workshop,
      procedure,
      equipment,
      cloudFilePaths,
      descrption
    } = this.data
    console.log(this.data)
    if (!username) {
      wx.showToast({ title: '提报人必填', icon: 'none' })
      return
    }
    if (!responsible) {
      wx.showToast({ title: '责任人必填', icon: 'none' })
      return
    }
    if (!workshop) {
      wx.showToast({ title: '请选择车间', icon: 'none' })
      return
    }
    if (!procedure) {
      wx.showToast({ title: '工序必填', icon: 'none' })
      return
    }
    if (!equipment) {
      wx.showToast({ title: '设备必填', icon: 'none' })
      return
    }
    const db = wx.cloud.database()
    wx.showLoading('loading...')
    db.collection('records').add({
      data: {
        username,
        responsible,
        workshop,
        procedure,
        equipment,
        cloudFilePaths,
        descrption,
        date: Date.now()
      }
    }).then(res => {
      wx.hideLoading()
      wx.showToast({ title: '提报成功!', icon: 'none' })
      console.log(res)
      this.setData({
        username: '',
        responsible: '',
        workshop: '',
        procedure: '',
        equipment: '',
        imgList: [],
        descrption: ''
      })
      wx.switchTab({
        url: '/pages/home/home'
      })
    }).catch(e => {
      wx.hideLoading();
      wx.showToast({ title: '提报失败', icon: 'none' })
      console.error(e)
    })
  },

  submit() {
    if (!this.data.cloudFilePaths.length) {
      this.uploadToCloud();
    } else {
      this.createRecord();
    }
  }
})