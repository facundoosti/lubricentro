require "rails_helper"

RSpec.describe "db/seeds.rb" do
  subject(:load_seeds) { silence_stream($stdout) { load Rails.root.join("db/seeds.rb") } }

  let(:seed_env) { { "SEED_ADMIN_PASSWORD" => nil, "SEED_OWNER_PASSWORD" => nil } }

  around do |example|
    previous = seed_env.keys.index_with { |key| ENV[key] }
    seed_env.each { |key, value| ENV[key] = value }
    example.run
  ensure
    previous.each { |key, value| ENV[key] = value }
  end

  def silence_stream(stream)
    original = stream.dup
    stream.reopen(File::NULL)
    yield
  ensure
    stream.reopen(original)
  end

  it "no versiona contraseñas en texto plano" do
    source = Rails.root.join("db/seeds.rb").read

    expect(source).not_to match(/password\s*=\s*['"]/)
  end

  context "sin las variables de contraseña" do
    it "no crea los usuarios iniciales" do
      expect { load_seeds }.not_to change(User, :count)
    end
  end

  context "con las variables de contraseña" do
    let(:seed_env) { { "SEED_ADMIN_PASSWORD" => "admin-pass-123", "SEED_OWNER_PASSWORD" => "owner-pass-456" } }

    it "crea los usuarios con la contraseña de la variable" do
      load_seeds

      expect(User.find_by(email: "facundoosti@gmail.com").authenticate("admin-pass-123")).to be_truthy
      expect(User.find_by(email: "lubricentrokillamet@gmail.com").authenticate("owner-pass-456")).to be_truthy
    end
  end
end
