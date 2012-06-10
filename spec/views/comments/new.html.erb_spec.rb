require 'spec_helper'

describe "comments/new" do
  before(:each) do
    assign(:comment, stub_model(Comment,
      :content => "MyString",
      :author_id => 1,
      :recipient_ids => "MyString",
      :group => "MyString",
      :tofu_id => 1,
      :updated_at => "MyString",
      :created_at => "MyString"
    ).as_new_record)
  end

  it "renders new comment form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form", :action => comments_path, :method => "post" do
      assert_select "input#comment_content", :name => "comment[content]"
      assert_select "input#comment_author_id", :name => "comment[author_id]"
      assert_select "input#comment_recipient_ids", :name => "comment[recipient_ids]"
      assert_select "input#comment_group", :name => "comment[group]"
      assert_select "input#comment_tofu_id", :name => "comment[tofu_id]"
      assert_select "input#comment_updated_at", :name => "comment[updated_at]"
      assert_select "input#comment_created_at", :name => "comment[created_at]"
    end
  end
end
